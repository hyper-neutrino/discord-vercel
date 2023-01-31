import { type NextRequest, NextResponse } from "next/server.js";
import nacl from "tweetnacl";

export const config = { runtime: "edge" };

export default async (req: NextRequest) => {
    const pk = process.env.APPLICATION_PUBLIC_KEY;
    if (!pk) return new NextResponse("Missing public key.", { status: 500 });

    const signature = req.headers.get("X-Signature-Ed25519");
    const timestamp = req.headers.get("X-Signature-Timestamp");

    if (!signature || !timestamp)
        return new NextResponse("Missing signature header(s).", {
            status: 401,
        });

    const body = await req.text();

    console.log(
        new TextEncoder().encode(timestamp + body),
        hexToArray(signature),
        hexToArray(pk)
    );

    if (
        !nacl.sign.detached.verify(
            new TextEncoder().encode(timestamp + body),
            hexToArray(signature),
            hexToArray(pk)
        )
    )
        return new NextResponse("Invalid signature.", { status: 401 });

    let data: any;

    try {
        data = JSON.parse(body);
    } catch {
        return new NextResponse("Invalid data format.", { status: 400 });
    }

    if (data.type === 1) return NextResponse.json({ type: 1 });
    else if (data.type === 2) {
        if (data.data.name === "greet") {
            return NextResponse.json({
                type: 4,
                data: { content: `Hello, ${data.data.options[0].value}!` },
            });
        }
    }

    return new NextResponse("Interaction not recognized.", { status: 400 });
};

function hexToArray(hexstring: string) {
    return Uint8Array.from(
        hexstring.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
}
