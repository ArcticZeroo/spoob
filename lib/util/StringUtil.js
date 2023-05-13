class StringUtil {
    /**
     * Potentially pluralizes a string...
     * @param string {string} - The string to make plural, potentially.
     * @param count {number} - The amount being counted.
     * @param {boolean} [cap=false] - Whether to capitalize the s.
     * @return {string}
     */
    static pluralize(string, count, cap = false) {
        if (count === 1) {
            if (string.toLowerCase().endsWith('s')) {
                return string.slice(0, string.length-2);
            }

            return string;
        } 
        if (string.toLowerCase().endsWith('s')) {
            return string;
        }

        return string + (cap) ? 'S' : 's';
        
    }

    /**
     * Get a UUID from a given string.
     * If the given string already has
     * dashes, it's returned. If not,
     * dashes are added.
     * @param string
     */
    static getUuid(string) {
        if (string.includes('-')) {
            return string;
        }

        return string.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
    }
}

module.exports = StringUtil;