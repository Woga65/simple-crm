export class Addr {
    id: string = ''
    firstName: string = '';
    lastName: string = '';
    birthDate: number | string = ''; //new Date('1990-01-01').getTime(); ;
    eMail: string = '';
    street: string = '';
    zipCode: string = '';
    city: string = '';
    marker: string = '';

    constructor(obj: any = {}) {
        for (const prop in this)
            this[prop] = obj[prop] || this[prop];
    }
    
    public toJSON() {
        return { ...this };     //Object.assign({}, this);
    }
    
    public hasData() {
        for (const prop in this) if (this[prop]) return true;
        return false;
    }
}
