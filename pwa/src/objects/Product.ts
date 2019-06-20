export class Product
{

    // =================================================================================================================
    // Main methods

    public static fromJSON(json: any): Product
    {
        const newPost = new Product(json.sku,
            json.name,
            json.price.amt,
            json.category,
            json.media[0]);
        return newPost;
    }
    // =================================================================================================================
    // Data
    private _sku: string;
    private _name: string;
    private _price: number;
    private _category: string;
    private _mainMedia: string;

    // =================================================================================================================
    // Constructor
    constructor
        (
            sku: string = '',
            name: string = '',
            price: number = 0,
            category: string = '',
            mainMedia: string = '',
    )
    {
        this.setSku(sku);
        this.setName(name);
        this.setPrice(price);
        this.setCategory(category);
        this.setMainMedia(mainMedia);
    }


    // =================================================================================================================
    // Getters & Setters

    public getSku(): string { return this._sku; }
    public setSku(value: string) { this._sku = value; }
    public getName(): string { return this._name; }
    public setName(value: string) { this._name = value; }
    public getPrice(): number { return this._price; }
    public setPrice(value: number) { this._price = value; }
    public getCategory(): string { return this._category; }
    public setCategory(value: string) { this._category = value; }
    public getMainMedia(): string { return this._mainMedia; }
    public setMainMedia(value: string) { this._mainMedia = value; }
    // =================================================================================================================
    // Helper methods

}
