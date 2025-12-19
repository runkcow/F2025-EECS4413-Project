
export const schematic = {
    id                   : { type: "number" },
    qty                  : { type: "number" },
    datetime             : { type: "string" },
    user_id              : { type: "number" },
    username             : { type: "string" },
    product_id           : { type: "number" },
    product_name         : { type: "string" },
    product_price        : { type: "number" },
    product_url          : { type: "string" },
    category_id          : { type: "number" },
    brand_id             : { type: "number" },
    shipping_street      : { type: "string" },
    shipping_city        : { type: "string" },
    shipping_province    : { type: "string" },
    shipping_country     : { type: "string" },
    shipping_zip_code    : { type: "string" },
    payment_type         : { type: "string" },
    payment_last4_digits : { type: "number" },
    payment_expiry_date  : { type: "string" },
    payment_provider     : { type: "string" },
};

export default class Order
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