export class Post {

    // =================================================================================================================
    // Main methods
    public static fromJSON(json: any): Post {
        const newPost = new Post(json.userId, json.id, json.title, json.body);
        return newPost;
    }
    // =================================================================================================================
    // Data
    private _uid: number;
    private _id: number;
    private _title: string;
    private _body: string;


    // =================================================================================================================
    // Constructor
    constructor
 (
        uid: number,
        id: number = 0,
        title: string = '',
        body: string = '',
    ) {
        this.setId(id);
        this.setUid(uid);
        this.setTitle(title);
        this.setBody(body);
    }

    // =================================================================================================================
    // Getters & Setters

    public getId(): number { return this._id; }
    public setId(value: number) { this._id = value; }
    public getUid(): number { return this._uid; }
    public setUid(value: number) { this._uid = value; }
    public getTitle(): string { return this._title; }
    public setTitle(value: string) { this._title = value; }
    public getBody(): string { return this._body; }
    public setBody(value: string) { this._body = value; }

    // =================================================================================================================
    // Helper methods
}
