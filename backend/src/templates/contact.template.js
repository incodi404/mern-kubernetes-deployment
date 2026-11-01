const escapeHtml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

/**
 * @param {object} query - the query document (name, mobile, email, query, createdAt, status)
 */
export const newQueryTemplate = (query) => {
    const { name, mobile, email, query: message, createdAt, status = "Pending" } = query;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New query received</title>
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
                    <h2 style="margin:0; color:#111;">New Query Received</h2>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="color:#444; font-size:16px; line-height:24px; padding-bottom:20px;">
                    Hi,
                    <br /><br />
                    You have received a new query from <strong>${escapeHtml(name)}</strong>.
                    Here are the details.
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
                        Contact
                      </p>
                      <p style="margin:0; color:#111; font-size:18px; font-weight:bold;">
                        ${escapeHtml(name)}
                      </p>
                      <p style="margin:4px 0 0 0; color:#444; font-size:15px;">
                        <a href="tel:${escapeHtml(mobile)}" style="color:#2563eb; text-decoration:none;">
                          ${escapeHtml(mobile)}
                        </a>
                      </p>
                      <p style="margin:4px 0 0 0; color:#444; font-size:15px;">
                        <a href="mailto:${escapeHtml(email)}" style="color:#2563eb; text-decoration:none;">
                          ${escapeHtml(email)}
                        </a>
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Query -->
                <tr>
                  <td style="padding-top:20px;">
                    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:16px;">
                      <p style="margin:0 0 8px 0; color:#999; font-size:13px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">
                        Query
                      </p>
                      <p style="margin:0; color:#444; font-size:15px; line-height:24px; white-space:pre-line;">
                        ${escapeHtml(message)}
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Meta -->
                <tr>
                  <td style="padding-top:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#444;">
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #f0f0f0;">Received on</td>
                        <td align="right" style="padding:8px 0; border-bottom:1px solid #f0f0f0;">
                          ${createdAt ? escapeHtml(formatDate(createdAt)) : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">Status</td>
                        <td align="right" style="padding:8px 0; color:#2563eb; font-weight:bold;">
                          ${escapeHtml(status)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- helper text -->
                <tr>
                  <td align="center" style="color:#666; font-size:14px; padding-top:30px;">
                    Please get in touch with the customer as soon as possible.
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