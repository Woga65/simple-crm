export class User {
    id: string = ''
    firstName: string = '';
    lastName: string = '';
    birthDate: number | string = ''; //new Date('1990-01-01').getTime(); ;
    eMail: string = '';
    street: string = '';
    zipCode: string = '';
    city: string = '';
    marker?: string ='';

    constructor(obj: any = {}) {
        for (const prop in this)
            this[prop] = obj[prop] || this[prop];
    }
    
    public toJSON() {
        return { ...this };
    }
    
    public hasData() {
        for (const prop in this) if (this[prop]) return true;
        return false;
    }
}


    /*
    public toJSON() {
        return Object.assign({}, this);
    }
    public toJSON() {
        let json = '{';
        for (const prop in this) {
            if (prop.startsWith('_')) continue;
            json += Number.isInteger(this[prop]) ? `"${prop}":${this[prop]},` : `"${prop}":"${this[prop]}",`; 
        }
        return JSON.parse(json.replace(/.$/,"}"));
    }
    */
