import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'noreply@charityplatform.com' }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html
    })

    if (error) {
      console.error('Email sending error:', error)
      throw new Error('Failed to send email')
    }

    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

export const emailTemplates = {
  donationConfirmation: (donorName: string, charityName: string, amount: number, receiptNumber: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Thank you for your donation!</h2>
      <p>Dear ${donorName},</p>
      <p>Thank you for your generous donation of $${amount} to ${charityName}.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Donation Details:</h3>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Charity:</strong> ${charityName}</p>
        <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>Your donation will make a real difference in the lives of those in need.</p>
      <p>Best regards,<br>The Charity Platform Team</p>
    </div>
  `,

  charityApproval: (charityName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Congratulations! Your charity has been approved</h2>
      <p>Dear ${charityName} Team,</p>
      <p>We're excited to inform you that your charity registration has been approved!</p>
      <p>You can now:</p>
      <ul>
        <li>Create and manage donation campaigns</li>
        <li>Receive donations from our platform</li>
        <li>Publish impact reports</li>
        <li>Engage with donors</li>
      </ul>
      <p>Welcome to our platform!</p>
      <p>Best regards,<br>The Charity Platform Team</p>
    </div>
  `,

  charityRejection: (charityName: string, reason: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Charity Registration Update</h2>
      <p>Dear ${charityName} Team,</p>
      <p>Thank you for your interest in joining our platform. Unfortunately, we cannot approve your registration at this time.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>You may reapply after addressing the mentioned concerns.</p>
      <p>Best regards,<br>The Charity Platform Team</p>
    </div>
  `,

  impactReportNotification: (donorName: string, charityName: string, reportTitle: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Impact Report from ${charityName}</h2>
      <p>Dear ${donorName},</p>
      <p>${charityName} has published a new impact report: "${reportTitle}"</p>
      <p>See how your donations are making a difference!</p>
      <p>Best regards,<br>The Charity Platform Team</p>
    </div>
  `
}
