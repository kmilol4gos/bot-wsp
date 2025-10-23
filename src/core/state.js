/**
 * Sistema de gestión de estado por usuario
 */

class StateManager {
	constructor() {
		this.states = new Map();
	}

	/**
	 * Obtiene el estado de un usuario
	 * @param {string} userId - ID del usuario
	 */
	get(userId) {
		if (!this.states.has(userId)) {
			this.states.set(userId, {});
		}
		return this.states.get(userId);
	}

	/**
	 * Actualiza el estado de un usuario
	 * @param {string} userId - ID del usuario
	 * @param {Object} data - Datos a actualizar
	 */
	update(userId, data) {
		const currentState = this.get(userId);
		this.states.set(userId, { ...currentState, ...data });
	}

	/**
	 * Limpia el estado de un usuario
	 * @param {string} userId - ID del usuario
	 */
	clear(userId) {
		this.states.delete(userId);
	}

	/**
	 * Obtiene todos los estados
	 */
	getAll() {
		return Object.fromEntries(this.states);
	}
}

module.exports = StateManager;
