
export const schematic = {
    id       : { type: "number" },
    street   : { type: "string" },
    city     : { type: "string" },
    province : { type: "string" },
    country  : { type: "string" },
    zip_code : { type: "string" },
    user_id  : { type: "number" },
}

export default class Address
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