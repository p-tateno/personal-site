---
title: コンタクト
---

感想やお問い合わせなど、お気軽にお送りください。

<form class="contact-form" id="contact-form" method="post">
  <fieldset disabled>
    <div class="contact-field">
      <label for="contact-name">お名前 <span>必須</span></label>
      <input id="contact-name" name="name" type="text" autocomplete="name" maxlength="100" required>
    </div>
    <div class="contact-field">
      <label for="contact-email">メールアドレス <span>必須</span></label>
      <input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required>
    </div>
    <div class="contact-field">
      <label for="contact-message">メッセージ <span>必須</span></label>
      <textarea id="contact-message" name="message" rows="7" maxlength="10000" required></textarea>
    </div>
    <div class="contact-honeypot" aria-hidden="true">
      <label for="contact-extra">この欄は空欄にしてください</label>
      <input id="contact-extra" name="_gotcha" type="text" tabindex="-1" autocomplete="off">
    </div>
    <input type="hidden" name="_subject" value="サイトからのお問い合わせ">
    <button type="submit">送信する</button>
  </fieldset>
  <p class="contact-status" role="status" aria-live="polite">現在、お問い合わせの受付を準備しています。</p>
  <p class="contact-note">入力内容は、お問い合わせへの返信のために使用します。送信処理には <a href="https://formspree.io/legal/privacy-policy/" rel="external">Formspree</a> を利用します。</p>
</form>
