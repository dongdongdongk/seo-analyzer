import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { feedback, analysisUrl } = await request.json()
    
    // 환경 변수 확인
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || '587')
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const feedbackEmail = process.env.FEEDBACK_EMAIL
    
    if (!smtpHost || !smtpUser || !smtpPass || !feedbackEmail) {
      console.error('SMTP 환경 변수가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: '이메일 설정이 완료되지 않았습니다.' },
        { status: 500 }
      )
    }
    
    // SMTP 전송기 설정
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // 587포트는 false, 465포트는 true
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
    
    // 이메일 내용 구성
    const ratingEmoji = ['😞', '😐', '😊', '😄', '🤩'][feedback.rating - 1] || '⭐'
    const helpfulText = feedback.helpful ? '✅ 도움이 되었음' : '❌ 도움이 되지 않음'
    
    const emailContent = `
      <h2>🌟 SEO 분석 서비스 피드백</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📊 분석 정보</h3>
        <p><strong>분석 URL:</strong> ${analysisUrl}</p>
        <p><strong>제출 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>⭐ 평가 결과</h3>
        <p><strong>전체 평점:</strong> ${feedback.rating}/5 ${ratingEmoji}</p>
        <p><strong>도움 여부:</strong> ${helpfulText}</p>
      </div>
      
      ${feedback.comment ? `
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>💬 추가 의견</h3>
          <p style="white-space: pre-wrap;">${feedback.comment}</p>
        </div>
      ` : ''}
      
      ${feedback.suggestions && feedback.suggestions.length > 0 ? `
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>💡 개선 제안</h3>
          <ul>
            ${feedback.suggestions.map((suggestion: string) => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 14px;">
        이 피드백은 SEO 분석 서비스 개선을 위해 자동으로 전송되었습니다.
      </p>
    `
    
    // 이메일 발송
    await transporter.sendMail({
      from: `"SEO 분석 서비스" <${smtpUser}>`,
      to: feedbackEmail,
      subject: `🌟 SEO 분석 피드백 - 평점: ${feedback.rating}/5`,
      html: emailContent
    })
    
    console.log('피드백 이메일 발송 성공:', {
      to: feedbackEmail,
      rating: feedback.rating,
      helpful: feedback.helpful,
      url: analysisUrl
    })
    
    return NextResponse.json({ 
      success: true, 
      message: '피드백이 성공적으로 전송되었습니다!' 
    })
    
  } catch (error) {
    console.error('피드백 이메일 발송 실패:', error)
    
    return NextResponse.json(
      { 
        error: '피드백 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}