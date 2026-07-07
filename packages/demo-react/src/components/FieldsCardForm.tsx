import type {FieldReferences} from "@citypay/elements-react";

export function FieldsCardForm({refs}: { refs: FieldReferences }) {
    const styles = {
        card: {
            width: "100%",
            maxWidth: "560px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(2,6,23,.06)",
            padding: "28px"
        },
        title: {fontSize: "20px", lineHeight: 1.2, margin: "0 0 18px 0"},
        label: {
            display: "block",
            fontSize: "12px",
            letterSpacing: ".02em",
            textTransform: "uppercase",
            color: "#64748b"
        },
        fieldWrap: {
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            background: "#fff",
            padding: "12px 14px",
            boxShadow: "inset 0 1px 0 rgba(2,6,23,.02)"
        },
        inputBase: {
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "16px",
            lineHeight: "24px",
            color: "#0f172a"
        },
        row: {display: "flex", gap: "12px", marginTop: "16px"},
        col: {flex: 1},
    } as const

    return (
        <div id="paymentForm" style={styles.card}>
            <h1 style={styles.title}>I belong to the host!</h1>

            <label
                id="name-label"
                htmlFor="cf-name"
                style={{...styles.label, margin: "16px 0 8px"}}
            >
                Name on card
            </label>

            <div id="name-wrap" style={styles.fieldWrap}>
                <input
                    id="cf-name"
                    ref={(e) => {
                        refs.name.current = e
                    }}
                    name="cardName"
                    type="text"
                    disabled={true}
                    style={{...styles.inputBase, height: "100%"}}
                />
            </div>

            <label
                id="pan-label"
                htmlFor="cf-pan"
                style={{...styles.label, margin: "16px 0 8px"}}
            >
                Card number
            </label>

            <div id="pan-wrap" style={styles.fieldWrap}>
                <input
                    id="cf-pan"
                    ref={(e) => {
                        refs.pan.current = e
                    }}
                    name="cardNumber"
                    type="text"
                    disabled={true}
                    style={{...styles.inputBase, letterSpacing: ".06em"}}
                />
            </div>

            <div style={styles.row}>
                <div style={styles.col}>
                    <label
                        id="expiry-label"
                        htmlFor="cf-expiry"
                        style={{...styles.label, margin: "0 0 8px"}}
                    >
                        Expiry (MM/YY)
                    </label>

                    <div id="expiry-wrap" style={styles.fieldWrap}>
                        <input
                            id="cf-expiry"
                            ref={(e) => {
                                refs.expiry.current = e
                            }}
                            name="exp"
                            type="text"
                            disabled={true}
                            style={styles.inputBase}
                        />
                    </div>
                </div>

                <div style={styles.col}>
                    <label
                        id="csc-label"
                        htmlFor="cf-csc"
                        style={{...styles.label, margin: "0 0 8px"}}
                    >
                        CSC
                    </label>

                    <div id="csc-wrap" style={styles.fieldWrap}>
                        <input
                            id="cf-csc"
                            ref={(e) => {
                                refs.csc.current = e
                            }}
                            name="cvc"
                            type="text"
                            disabled={true}
                            style={styles.inputBase}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
