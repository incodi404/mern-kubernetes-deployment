import { notificationClass } from "../class/Notification.class.js"
import { agenda } from "../db/agenda.db.js"
import { newQueryTemplate } from "../templates/contact.template.js"
import { newOrderTemplate } from "../templates/interestedProduct.template.js"

agenda.define("send_interested_product_email", async (job) => {
    const {
        order,
        email
    } = job?.attrs?.data

    console.log("[INFO] Email job received")

    const emailRes = await notificationClass.emailSender(
        email, "Someone Interested In Your Product", newOrderTemplate(order)
    )
    if (!emailRes?.isSuccess) {
        console.log("[ERROR] Failed to send email :: ", email)
    }

    console.log("[INFO] Email has been sent :: ", email)
})

agenda.define("send_query_email", async (job) => {
    const {
        query,
        email
    } = job?.attrs?.data

    console.log("[INFO] Email job received")

    const emailRes = await notificationClass.emailSender(
        email, "New Query on The Gallery", newQueryTemplate(query)
    )
    if (!emailRes?.isSuccess) {
        console.log("[ERROR] Failed to send email :: ", email)
    }

    console.log("[INFO] Email has been sent :: ", email)
})