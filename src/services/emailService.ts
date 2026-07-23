import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const sendPasswordResetEmail = async (toEmail: string, otpCode: string) => {
  const subject = 'Mã xác nhận đặt lại mật khẩu - TOTO Barbershop';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">TOTO Barbershop</h2>
      <p>Xin chào,</p>
      <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản tại TOTO Barbershop.</p>
      <p>Mã xác nhận (OTP) của bạn là:</p>
      <h1 style="background: #f4f4f4; padding: 10px 20px; letter-spacing: 5px; text-align: center; color: #000; border-radius: 4px;">${otpCode}</h1>
      <p style="color: #666; font-size: 14px;">Mã này sẽ hết hạn sau 15 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
      <p>Nếu bạn không yêu cầu đặt lại mật khẩu, xin vui lòng bỏ qua email này.</p>
      <p>Trân trọng,<br>Đội ngũ TOTO Barbershop</p>
    </div>
  `;

  if (!resend) {
    console.log('\n======================================================');
    console.log('⚠️ CẢNH BÁO: CHƯA CẤU HÌNH RESEND_API_KEY TRONG .ENV ⚠️');
    console.log('Gửi email giả lập tới:', toEmail);
    console.log('MÃ OTP CỦA BẠN LÀ:', otpCode);
    console.log('======================================================\n');
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'TOTO Barbershop <onboarding@resend.dev>', // Dùng email dev để test
      to: toEmail,
      subject,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};
