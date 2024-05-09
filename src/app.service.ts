import { Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class AppService {
  private envio = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: false,
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })

  getHello(): { message: string } {
    return { message: 'Hello World!' };
  }
  getOla(): { message: string } {
    return { message: 'Olá, Mundo!' };
  }

  verificaPagina(pagina: number, limite: number) {
    if (!pagina) pagina = 1;
    if (!limite) limite = 10;
    if (pagina < 1) pagina = 1;
    if (limite < 1) limite = 10;
    return [pagina, limite];
  }

  verificaLimite(pagina: number, limite: number, total: number) {
    if ((pagina - 1) * limite >= total) pagina = Math.ceil(total / limite);
    return [pagina, limite];
  }

  emailAtualizacaoChamado(
    nome: string,
    num_chamado: string,
    chamado_status: string,
    suporte: string,
    link: string
  ) {
    const mail = `<!doctypehtml><html lang=en><meta content="width=device-width,initial-scale=1"name=viewport><meta content="text/html; charset=UTF-8"http-equiv=Content-Type><title>Simple Transactional Email</title><style media=all>body{font-family:Helvetica,sans-serif;-webkit-font-smoothing:antialiased;font-size:16px;line-height:1.3;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}table{border-collapse:separate;mso-table-lspace:0;mso-table-rspace:0;width:100%}table td{font-family:Helvetica,sans-serif;font-size:16px;vertical-align:top}body{background-color:#f4f5f6;margin:0;padding:0}.body{background-color:#f4f5f6;width:100%}.container{margin:0 auto!important;max-width:600px;padding:0;padding-top:24px;width:600px}.content{box-sizing:border-box;display:block;margin:0 auto;max-width:600px;padding:0}.main{background:#fff;border:1px solid #eaebed;border-radius:16px;width:100%}.wrapper{box-sizing:border-box;padding:24px}.footer{clear:both;padding-top:24px;text-align:center;width:100%}.footer a,.footer p,.footer span,.footer td{color:#9a9ea6;font-size:16px;text-align:center}p{font-family:Helvetica,sans-serif;font-size:16px;font-weight:400;margin:0;margin-bottom:16px}a{color:#0867ec;text-decoration:underline}.btn{box-sizing:border-box;min-width:100%!important;width:100%}.btn>tbody>tr>td{padding-bottom:16px}.btn table{width:auto}.btn table td{background-color:#fff;border-radius:4px;text-align:center}.btn a{background-color:#fff;border:solid 2px #0867ec;border-radius:4px;box-sizing:border-box;color:#0867ec;cursor:pointer;display:inline-block;font-size:16px;font-weight:700;margin:0;padding:12px 24px;text-decoration:none;text-transform:capitalize}.btn-primary table td{background-color:#0867ec}.btn-primary a{background-color:#0867ec;border-color:#0867ec;color:#fff}@media all{.btn-primary table td:hover{background-color:#ec0867!important}.btn-primary a:hover{background-color:#ec0867!important;border-color:#ec0867!important}}.last{margin-bottom:0}.first{margin-top:0}.align-center{text-align:center}.align-right{text-align:right}.align-left{text-align:left}.text-link{color:#0867ec!important;text-decoration:underline!important}.clear{clear:both}.mt0{margin-top:0}.mb0{margin-bottom:0}.preheader{color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0}.powered-by a{text-decoration:none}@media only screen and (max-width:640px){.main p,.main span,.main td{font-size:16px!important}.wrapper{padding:8px!important}.content{padding:0!important}.container{padding:0!important;padding-top:8px!important;width:100%!important}.main{border-left-width:0!important;border-radius:0!important;border-right-width:0!important}.btn table{max-width:100%!important;width:100%!important}.btn a{font-size:16px!important;max-width:100%!important;width:100%!important}}@media all{.ExternalClass{width:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.apple-link a{color:inherit!important;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;line-height:inherit!important;text-decoration:none!important}#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}}</style><table border=0 cellpadding=0 cellspacing=0 role=presentation class=body><tr><td> <td class=container><div class=content><span class=preheader> ${chamado_status} </span><table border=0 cellpadding=0 cellspacing=0 role=presentation class=main><tr><td class=wrapper><h3>Olá, ${nome} </h3><p>Há uma nova atualização no chamado ${num_chamado}.<p>Seu novo status é: ${chamado_status}.<table border=0 cellpadding=0 cellspacing=0 role=presentation class="btn btn-primary"><tr><td align=left><table border=0 cellpadding=0 cellspacing=0 role=presentation><tr><td><a href=${link} target=_blank>Abrir</a></table></table></table><div class=footer><table border=0 cellpadding=0 cellspacing=0 role=presentation><tr><td class=content-block><span class=apple-link>SMUL - Secretaria Municipal de Urbanismo e Licenciamento</span><tr><td class="content-block powered-by">${suporte}</table><br></div></div><td> </table>`;
    return mail;
  }

  async enviaEmail(
    assunto: string,
    corpo: string,
    destinatarios: string[],
  ) {
    try {
      const enviado = await this.envio.sendMail({
        from: `"SMUL Suporte - Não Responda" <${process.env.MAIL_USER}>`, // sender address
        to: destinatarios, // list of receivers
        subject: assunto, // Subject line
        html: corpo
      });
      console.log(enviado);
    } catch (error) {
      console.log(error);
    }
  }

}
