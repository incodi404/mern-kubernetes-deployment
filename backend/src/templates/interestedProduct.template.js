const escapeHtml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const formatPrice = (amount, currency = "₹") =>
    `${currency}${Number(amount || 0).toLocaleString("en-IN")}`;

/**
 * @param {object} order - the order document (userName, userPhone, productSnapshot, variantSnapshot, totalQuantity)
 * @param {object} [options]
 * @param {string} [options.currency]
 */
export const newOrderTemplate = (order, options = {}) => {
    const { currency = "₹" } = options;

    const { userName, userPhone, productSnapshot = {}, variantSnapshot = {}, totalQuantity = 1 } = order;

    const { title, subTitle, description } = productSnapshot;
    const { value, variantId, mrp, discount, sellingPrice } = variantSnapshot;

    const total = Number(sellingPrice || 0) * Number(totalQuantity || 0);
    const hasDiscount = Number(discount) > 0 || Number(mrp) > Number(sellingPrice);

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New order received</title>
      </head>

      <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:40px 0;">
          <tr>
            <td align="center">

              <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">

                <!-- Title -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <h2 style="margin:0; color:#111;">New Order Received</h2>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="color:#444; font-size:16px; line-height:24px; padding-bottom:20px;">
                    Hi,
                    <br /><br />
                    You have received a new order from <strong>${escapeHtml(userName)}</strong>.
                    Here are the details of the order.
                  </td>
                </tr>

                <!-- Customer details -->
                <tr>
                  <td style="padding:20px 0 10px 0;">
                    <div style="
                          background-color:#f0f4ff;
                          border:1px dashed #2563eb;
                          border-radius:8px;
                          padding:18px 24px;
                        ">
                      <p style="margin:0 0 6px 0; color:#2563eb; font-size:13px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">
                        Customer
                      </p>
                      <p style="margin:0; color:#111; font-size:18px; font-weight:bold;">
                        ${escapeHtml(userName)}
                      </p>
                      <p style="margin:4px 0 0 0; color:#444; font-size:15px;">
                        <a href="tel:${escapeHtml(userPhone)}" style="color:#2563eb; text-decoration:none;">
                          ${escapeHtml(userPhone)}
                        </a>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Product -->
                <tr>
                  <td style="padding-top:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                          style="border:1px solid #e5e7eb; border-radius:8px;">
                      <tr>
                        <td valign="top" style="padding:16px; color:#444; font-size:14px; line-height:22px;">
                          <p style="margin:0; color:#111; font-size:17px; font-weight:bold;">
                            ${escapeHtml(title)}
                          </p>
                          ${subTitle ? `<p style="margin:2px 0 8px 0; color:#666; font-size:14px;">${escapeHtml(subTitle)}</p>` : ""}
                          ${description ? `<p style="margin:0; color:#888; font-size:13px;">${escapeHtml(description)}</p>` : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Order summary -->
                <tr>
                  <td style="padding-top:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#444;">
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0;">Variant</td>
                        <td align="right" style="padding:8px 0; border-bottom:1px solid #f0f0f0;">
                          ${escapeHtml(value)} <span style="color:#999;">(${escapeHtml(variantId)})</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0;">Quantity</td>
                        <td align="right" style="padding:8px 0; border-bottom:1px solid #f0f0f0;">
                          ${escapeHtml(totalQuantity)}
                        </td>
                      </tr>
                      ${hasDiscount
            ? `<tr>
                              <td style="padding:8px 0; border-bottom:1px solid #f0f0f0;">MRP</td>
                              <td align="right" style="padding:8px 0; border-bottom:1px solid #f0f0f0; color:#999; text-decoration:line-through;">
                                ${formatPrice(mrp, currency)}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:8px 0; border-bottom:1px solid #f0f0f0;">Discount</td>
                              <td align="right" style="padding:8px 0; border-bottom:1px solid #f0f0f0; color:#16a34a;">
                                ${escapeHtml(discount)}%
                              </td>
                            </tr>`
            : ""
        }
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0;">Price per unit</td>
                        <td align="right" style="padding:8px 0; border-bottom:1px solid #f0f0f0;">
                          ${formatPrice(sellingPrice, currency)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 0 0 0; color:#111; font-size:16px; font-weight:bold;">Total</td>
                        <td align="right" style="padding:14px 0 0 0; color:#2563eb; font-size:20px; font-weight:bold;">
                          ${formatPrice(total, currency)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- helper text -->
                <tr>
                  <td align="center" style="color:#666; font-size:14px; padding-top:30px;">
                    Please contact the customer to confirm and process this order.
                  </td>
                </tr>

                <!-- footer -->
                <tr>
                  <td style="padding-top:30px; color:#aaa; font-size:12px;" align="center">
                    This is an automated notification. Please do not reply to this email.
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
    `;
};