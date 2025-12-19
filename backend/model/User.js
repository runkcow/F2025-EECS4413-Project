
// experimental backend regex and string size limit
// export const schematic = {
//     id           : { type: "number" },
//     username     : { type: "string", maxLen: 10 },
//     password     : { type: "string" },
//     first_name   : { type: "string" },
//     last_name    : { type: "string" },
//     phone_number : { type: "string", minLen: 10, maxLen: 10 },
//     email        : { type: "string", regex: /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/ },
//     access_id    : { type: "number" },
// }
export const schematic = {
    id           : { type: "number" },
    username     : { type: "string" },
    password     : { type: "string" },
    first_name   : { type: "string" },
    last_name    : { type: "string" },
    phone_number : { type: "string" },
    email        : { type: "string" },
    access_id    : { type: "number" },
}

export default class User
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