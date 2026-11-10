/**
 * confirmar-borrado.ts
 *
 * Extensión de Pi que solicita confirmación al usuario antes de ejecutar
 * cualquier comando bash que contenga instrucciones de eliminación:
 *   rm, rmdir, unlink, shred, find -delete, git clean, git rm
 *
 * Ubicación: .pi/extensions/confirmar-borrado.ts (auto-descubierta).
 * Recargar tras editar con: /reload
 */

import { type ExtensionAPI, isToolCallEventType } from "@earendil-works/pi-coding-agent";

/**
 * Patrones que identifican comandos de eliminación.
 * Se usan límites de palabra (\b) para evitar falsos positivos
 * (p. ej. "format" no dispara el patrón de "rm").
 */
const PATRONES_ELIMINACION: RegExp[] = [
	/\brm\b/, // rm con cualquier combinación de flags (-r, -f, -rf, --recursive...)
	/\brmdir\b/, // borrado de directorios vacíos
	/\bunlink\b/, // borrado de archivos individuales
	/\bshred\b/, // borrado seguro/irrecuperable
	/\bfind\b[^;|&]*\s-delete\b/, // find ... -delete
	/\bgit\s+clean\b/, // elimina archivos sin trackear
	/\bgit\s+rm\b/, // elimina archivos del repositorio y del disco
];

function esComandoDeEliminacion(command: string): boolean {
	return PATRONES_ELIMINACION.some((patron) => patron.test(command));
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		// Solo nos interesan las llamadas a la herramienta bash (input tipado)
		if (!isToolCallEventType("bash", event)) return undefined;

		const command = event.input.command;

		if (!esComandoDeEliminacion(command)) return undefined;

		// Sin UI interactiva (p. ej. modo RPC): bloquear por defecto (fail closed)
		if (!ctx.hasUI) {
			return {
				block: true,
				reason: `Comando de eliminación bloqueado automáticamente (no hay UI para confirmar): ${command}`,
			};
		}

		// Diálogo de confirmación nativo del TUI mostrando el comando completo
		const confirmado = await ctx.ui.confirm(
			"⚠️ Comando de eliminación detectado",
			`¿Permitir ejecutar este comando?\n\n${command}`,
		);

		if (!confirmado) {
			ctx.ui.notify("Comando bloqueado por el usuario", "warning");
			return {
				block: true,
				reason: `El usuario rechazó la ejecución del comando de eliminación: ${command}`,
			};
		}

		ctx.ui.notify("Ejecución autorizada por el usuario", "info");
		return undefined; // Continuar con la ejecución normal del comando
	});
}
