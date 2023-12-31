export class Dictionary<KT, VT> {
    private keys: KT[] = [];
    private values: VT[] = [];
    protected catheData: { [key: string]: any } = {};
    protected nElements: number;
    private isCache: boolean;
    public get len(): number {
        return this.count();
    }

    public constructor(isCache: boolean = true) {
        this.isCache = isCache;
    }

    /**给字典增加一条数据,返回字典的长度 */
    public add(key: any, value: any): number {
        if (this.containsKey(key)) {
            this.setDicValue(key, value);
        }
        else {
            if (this.isCache) {
                this.catheData[key as string] = value;
            }
            this.keys.push(key);
            this.values.push(value);
            this.nElements++;
        }
        return this.nElements;
    }

    public remove(key: any) {
        var index = this.keys.indexOf(key, 0);
        if (index != -1) {
            this.keys.splice(index, 1);
            this.values.splice(index, 1);
            if (this.isCache) {
                delete this.catheData[key as string];
            }
            this.nElements--;
        }
    }

    private count(): number {
        return this.keys.length;
    }

    /**直接使用SetDicValue()修改已经存在的字典数据项，并更新缓存引用 */
    public setDicValue(key: any, value: any) {
        if (this.containsKey(key)) {
            let index = this.keys.indexOf(key, 0);
            this.keys[index] = key;
            this.values[index] = value;
            if (this.isCache) {
                this.catheData[key as string] = value;
            }
            return;
        }
        else {
            this.add(key, value);
        }
    }

    /**
     *开启"[]"访问的情况下，缓存与字典数据为同一份，引用数据会同时修改，
     *非引用数据不能被修改，只能访问
     */
    public tryGetValue(key: KT): VT {
        var index = this.keys.indexOf(key, 0);
        if (index != -1) {
            return this.values[index];
        }
        return null;
    }

    public containsKey(key: any): boolean {
        let ks = this.keys;
        for (let i = 0; i < ks.length; ++i) {
            if (ks[i] == key) {
                return true;;
            }
        }
        return false;
    }

    public getKeys(): KT[] {
        return this.keys;
    }

    public getValues(): VT[] {
        return this.values;
    }

    public clear() {
        this.keys = [];
        this.values = [];
        this.catheData = {};
        this.nElements = 0;
    }

    public isEmpty(): boolean {
        return this.nElements <= 0;
    }
}