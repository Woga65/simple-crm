export class User {
    firstName: string = '';
    lastName: string = '';
    birthDate: number = 0;
    street: string = '';
    zipCode: string = '';
    city: string = '';

    constructor(obj: any = {}) {
        for (const prop in this)
            this[prop] = obj[prop] || this[prop];

        /*this.firstName = obj.firstName || ''; 
        this.lastName = obj.lastName || ''; 
        this.birthDate = obj.birthDate || 0; 
        this.street = obj.street || ''; 
        this.zipCode = obj.zipCode || ''; 
        this.city = obj.city || '';*/
    }
    public toJSON() {
        let json = '{';
        for (const prop in this) {
            json += Number.isInteger(this[prop]) ? `"${prop}":${this[prop]},` : `"${prop}":"${this[prop]}",`; 
        }
        return JSON.parse(json.replace(/.$/,"}"));
    }
}
