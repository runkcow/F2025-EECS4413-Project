
export const schematic = {
    id          : { type: "number" },
    name        : { type: "string" },
    description : { type: "string" },
    price       : { type: "number" },
    stock       : { type: "number" },
    url         : { type: "string" },
    category_id : { type: "number" },
    brand_id    : { type: "number" },
}

export default class Product
{
    constructor(data)
    {
        for (const K in schematic)
        {
            this[K] = data[K] ?? null;
        }
    }

    validate()
    {
        for (const K in schematic)
        {
            if (this[K] === undefined || this[K] === null) { throw new Error(`Invalid ${K}`); }
            for (const C in schematic[K])
            {
                if (C === "type" && typeof this[K] !== schematic[K][C]) { throw new Error(`Invalid ${K}`); } 
                if (C === "minLen" && this[K].length < schematic[K][C]) { throw new Error(`Invalid ${K}`); }
                if (C === "maxLen" && this[K].length > schematic[K][C]) { throw new Error(`Invalid ${K}`); }
                if (C === "regex" && !schematic[K][C].test(this[K])) { throw new Error(`Invalid ${K}`); }
            }
        }
    }

    toJSON() {
        return { ...this };
    }
}