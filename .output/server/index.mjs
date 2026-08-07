globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/assets/admin-D-vRDwN-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ab-w6pxztCh/aP0DSTYlS/KCQDZ2aI"',
    "mtime": "2026-08-07T18:24:50.761Z",
    "size": 1195,
    "path": "../public/assets/admin-D-vRDwN-.js"
  },
  "/assets/admin.assinaturas-C0SSdozF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"425b-Ck07eESGYdC+6+OMHSV+mQuoH+Y"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 16987,
    "path": "../public/assets/admin.assinaturas-C0SSdozF.js"
  },
  "/assets/admin.agenda-CCzE5IkW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20ae-IUPgCmEDkMzcAtBhtlZfMEexjhA"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 8366,
    "path": "../public/assets/admin.agenda-CCzE5IkW.js"
  },
  "/assets/admin.clientes-D_YGCsmR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"23bb-k4l9wiNmnUj5oeCiswIE49NWSGE"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 9147,
    "path": "../public/assets/admin.clientes-D_YGCsmR.js"
  },
  "/assets/admin.bloqueios-CoKgrkCf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24cc-C/CkTc0+WB6RPUdX9URIsu++CLk"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 9420,
    "path": "../public/assets/admin.bloqueios-CoKgrkCf.js"
  },
  "/assets/admin.configuracoes-Czy9CJHc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2481-I7ScR7nKqlvwb0HB8Mfut+ca9xw"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 9345,
    "path": "../public/assets/admin.configuracoes-Czy9CJHc.js"
  },
  "/assets/admin.relatorios-Cvbjhrpj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4700-NYzRx9sJuJ4WV3uhQsEahdLJMl8"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 18176,
    "path": "../public/assets/admin.relatorios-Cvbjhrpj.js"
  },
  "/assets/admin.marketing-CqSlsht3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cc9-11BxmNzq9hnPOy5+y+ZLFTPRZvE"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 3273,
    "path": "../public/assets/admin.marketing-CqSlsht3.js"
  },
  "/assets/admin.usuarios-fLFnUH_w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fd3-Lyl0nS/+0nxhfrQNjAsUc9m9jRM"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 8147,
    "path": "../public/assets/admin.usuarios-fLFnUH_w.js"
  },
  "/assets/admin.index-cKxVb5i9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25b2-W9dp3MlZDVzoIoQqVVTLrbfl1hs"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 9650,
    "path": "../public/assets/admin.index-cKxVb5i9.js"
  },
  "/assets/agendamento.functions-DG5UOWiz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4c4-Gl54V+nQITAjO1C1cU5PpdG16dQ"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 1220,
    "path": "../public/assets/agendamento.functions-DG5UOWiz.js"
  },
  "/assets/admin.financeiro-TsJngaSk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"674a-b9CfFoz+h5pfrBlJjVO3X5109fQ"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 26442,
    "path": "../public/assets/admin.financeiro-TsJngaSk.js"
  },
  "/assets/badge-Cp5Xe5Pa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f3-cUgn6UAdG64/Am3ZId6/JLLJQ68"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 755,
    "path": "../public/assets/badge-Cp5Xe5Pa.js"
  },
  "/assets/assinatura.functions-BVGBmo10.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3f7-ohGqoUs+I6Y8QDuu798XTWRubW0"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 1015,
    "path": "../public/assets/assinatura.functions-BVGBmo10.js"
  },
  "/assets/arrow-right-DfCPhVSP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-Hh8BM4wuYJMXpPL1Pht4Xtgrhqo"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 177,
    "path": "../public/assets/arrow-right-DfCPhVSP.js"
  },
  "/assets/bloqueio-agenda.functions-BY3KxJl3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17e-CZxkgLcEfh1FwxnpsiyZ6mLg6LE"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 382,
    "path": "../public/assets/bloqueio-agenda.functions-BY3KxJl3.js"
  },
  "/assets/button-ANyqzYIE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7c1a-VBM4u/lXGxjbdgE+CT33bJwRsIU"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 31770,
    "path": "../public/assets/button-ANyqzYIE.js"
  },
  "/assets/cadastro-B7PwT4bv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a08-G7XOBbWoPQpw8+UtXF+T3noCjyk"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 2568,
    "path": "../public/assets/cadastro-B7PwT4bv.js"
  },
  "/assets/calendar-check-BpPV_PGf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13d-xMae7YWkc1c5TZbAr57aiHHh7ag"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 317,
    "path": "../public/assets/calendar-check-BpPV_PGf.js"
  },
  "/assets/calendar-clock-BTZ8zvKs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"181-7LBP4fOqrwKRTBJ1V/kNkBQvO3E"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 385,
    "path": "../public/assets/calendar-clock-BTZ8zvKs.js"
  },
  "/assets/calendar-DHTTb-Ex.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10d-I7guUCMWUiUdRRXs1wf5yaWf/FI"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 269,
    "path": "../public/assets/calendar-DHTTb-Ex.js"
  },
  "/assets/calendar-x-2-OTS98LvY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"173-VT2WiXNjyU9B1hYBfFOr/0nJo44"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 371,
    "path": "../public/assets/calendar-x-2-OTS98LvY.js"
  },
  "/assets/card-Sla4QwFK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3fb-wRV/JmIGZPIPAt9feYsorBEcPK8"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 1019,
    "path": "../public/assets/card-Sla4QwFK.js"
  },
  "/assets/catalogo.functions-Ci5lIoOJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"38d-6mKWpwndWVO7JovtjaiP0AgW/bw"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 909,
    "path": "../public/assets/catalogo.functions-Ci5lIoOJ.js"
  },
  "/assets/chart-column-D2Enamhk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-qtXQqcJj0MmPZhXYW2bsLOML6Xw"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 263,
    "path": "../public/assets/chart-column-D2Enamhk.js"
  },
  "/assets/circle-check-DT11saTO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b9-EuQH7VvnUikHqJ6Zgh0H3v1NTTk"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 185,
    "path": "../public/assets/circle-check-DT11saTO.js"
  },
  "/assets/circle-x-BRDsghV7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d6-D8xplGNQcXvu/lmNm5FulTsHwaM"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 214,
    "path": "../public/assets/circle-x-BRDsghV7.js"
  },
  "/assets/cliente.beneficios-WWaIzzYH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"480-dxiiuxVvJL6OCsVwvzj0IrJb8Zc"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 1152,
    "path": "../public/assets/cliente.beneficios-WWaIzzYH.js"
  },
  "/assets/cliente.agendamentos-CqEfUtEY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe5-ECwIbRBPHW+SGrso4k8iXe6438M"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 12261,
    "path": "../public/assets/cliente.agendamentos-CqEfUtEY.js"
  },
  "/assets/cliente-S-e78VAE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46c-x+ZQG0nPPM90nO+Iu54l51y9r9U"',
    "mtime": "2026-08-07T18:24:50.761Z",
    "size": 1132,
    "path": "../public/assets/cliente-S-e78VAE.js"
  },
  "/assets/cliente.fidelidade-Bl_8hNZl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18db-OZ2iUTGQkjNJO3hVf7XSMXMHQpk"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 6363,
    "path": "../public/assets/cliente.fidelidade-Bl_8hNZl.js"
  },
  "/assets/cliente.assinatura-Dr9Fe_gy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e25-hUXF4HnjFOpgAbdRMCZVfe2b4AQ"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 7717,
    "path": "../public/assets/cliente.assinatura-Dr9Fe_gy.js"
  },
  "/assets/cliente.historico-C2HS1fKv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1732-hCq/UfnTyn+3wSiYisBXOhhl/G4"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 5938,
    "path": "../public/assets/cliente.historico-C2HS1fKv.js"
  },
  "/assets/cliente.index-DFpvBUas.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d63-1UUs3JTQF/x2u466WSv+HyZknjg"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 7523,
    "path": "../public/assets/cliente.index-DFpvBUas.js"
  },
  "/assets/cliente.perfil-5az7B-Rf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ac6-kLbnKVBiddXkNUMiuuuAkvDzl7Y"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 2758,
    "path": "../public/assets/cliente.perfil-5az7B-Rf.js"
  },
  "/assets/clock-Cv0AWOz8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-GX4aUVxU2HNtMDshHEnLhES0RhA"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 176,
    "path": "../public/assets/clock-Cv0AWOz8.js"
  },
  "/assets/createLucideIcon-ClADeRMJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4b2-XshRn1k+TzyQiRUdAbaItCsPdiM"',
    "mtime": "2026-08-07T18:24:50.764Z",
    "size": 1202,
    "path": "../public/assets/createLucideIcon-ClADeRMJ.js"
  },
  "/assets/credit-card-z1sk0epJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"db-xoeTD2N1vatyMTf7pevw8RP0A2k"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 219,
    "path": "../public/assets/credit-card-z1sk0epJ.js"
  },
  "/assets/crown-DHtn2YKR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"176-CdYs9RHzlloa8WczwOXkEW5GIPE"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 374,
    "path": "../public/assets/crown-DHtn2YKR.js"
  },
  "/assets/dollar-sign-CNXyh46f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e7-CH4/l7XFOiyhSLDdPr+O0tyVvqw"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 231,
    "path": "../public/assets/dollar-sign-CNXyh46f.js"
  },
  "/assets/file-chart-column-increasing-Cik10KO-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a3-6McCr0ioCcTW/78UCfaF2PxJwA0"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 419,
    "path": "../public/assets/file-chart-column-increasing-Cik10KO-.js"
  },
  "/assets/funcionario-CHOUv3eY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"401-u7BQOphmEvMGOopb0TYTMP+MYtM"',
    "mtime": "2026-08-07T18:24:50.761Z",
    "size": 1025,
    "path": "../public/assets/funcionario-CHOUv3eY.js"
  },
  "/assets/funcionario.index-DgsYk_4b.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13a1-XzMEBmGRuUfrn5IJlURXIuNSSEI"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 5025,
    "path": "../public/assets/funcionario.index-DgsYk_4b.js"
  },
  "/assets/funcionario.bloqueios-UCiO7Id5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24cc-QOtpTx/SuEGPyTa0GcFGAtqjmQY"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 9420,
    "path": "../public/assets/funcionario.bloqueios-UCiO7Id5.js"
  },
  "/assets/gift-CEAAWBcc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"169-OumlBTkEcWw0fnvk4BFGboQ8YLI"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 361,
    "path": "../public/assets/gift-CEAAWBcc.js"
  },
  "/assets/funcionario.solicitacoes-DWQrNMdn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29ee-qV1DnQIEW3nTXuixvD1R+Hnmw9Y"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 10734,
    "path": "../public/assets/funcionario.solicitacoes-DWQrNMdn.js"
  },
  "/assets/history-JKqg7kKF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f9-ARC3tt5HjRzMushf/ukN1lnleWw"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 249,
    "path": "../public/assets/history-JKqg7kKF.js"
  },
  "/assets/index-UuovwwaW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f11-bc24cZ0q4Qrp44IQAL1LqAXIKdo"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 12049,
    "path": "../public/assets/index-UuovwwaW.js"
  },
  "/assets/input-ChZfUw9k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24f-ucIkxO6t8xFsgMQfWoL4E4HZtp8"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 591,
    "path": "../public/assets/input-ChZfUw9k.js"
  },
  "/assets/index-BU2Sg_jO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"592bd-myTF6+2zzdF+LMzI9OSDvoTTFiE"',
    "mtime": "2026-08-07T18:24:50.761Z",
    "size": 365245,
    "path": "../public/assets/index-BU2Sg_jO.js"
  },
  "/assets/label-5282kNQx.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"38a-XyMAD6kHjs9zTAtw5YSl0dYU0Gw"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 906,
    "path": "../public/assets/label-5282kNQx.js"
  },
  "/assets/layout-dashboard-Bxbz6S0r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16b-Eg62Rmtxw8669Kqc7CGxSmuNoqw"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 363,
    "path": "../public/assets/layout-dashboard-Bxbz6S0r.js"
  },
  "/assets/logout-Bao2P6kC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"68b-O/NHNmIw458oGrVEZU1tptrX2Gc"',
    "mtime": "2026-08-07T18:24:50.761Z",
    "size": 1675,
    "path": "../public/assets/logout-Bao2P6kC.js"
  },
  "/assets/log-out-BAsz75gp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2-lXl5Q3OiNxiHc2AuN1j2TENedv8"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 242,
    "path": "../public/assets/log-out-BAsz75gp.js"
  },
  "/assets/phone-BgxkdRxw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f3-aOh3vxI9NS4LB1chb+BJ/w5iVis"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 499,
    "path": "../public/assets/phone-BgxkdRxw.js"
  },
  "/assets/login-DxD4oDoY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"988-XFFhWDCxx06HiGJEyXD9+I0pEx0"',
    "mtime": "2026-08-07T18:24:50.751Z",
    "size": 2440,
    "path": "../public/assets/login-DxD4oDoY.js"
  },
  "/assets/plus-CPP-U_jq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a5-o48xSUxTnNixc7VZ7aoNkRtBvY4"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 165,
    "path": "../public/assets/plus-CPP-U_jq.js"
  },
  "/assets/receipt-DJGC0p7y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"130-drgct470jZFPrIrklJDwXg+Eznc"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 304,
    "path": "../public/assets/receipt-DJGC0p7y.js"
  },
  "/assets/refresh-cw-yCyrSsI_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14d-82Ml9z9GO3MOIXdeyX4SrkHttM8"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 333,
    "path": "../public/assets/refresh-cw-yCyrSsI_.js"
  },
  "/assets/scissors-kWa3rWm5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13e-bWd/bdHH/phbCkXenPyczZ0gRss"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 318,
    "path": "../public/assets/scissors-kWa3rWm5.js"
  },
  "/assets/shield-check-C-uelzRR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"147-j5YSHnsUNBjNBDsOEJ6dVRfP5C4"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 327,
    "path": "../public/assets/shield-check-C-uelzRR.js"
  },
  "/assets/Sidebar-Bp3ymqpp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9e0-DFAXhoKBoliGKu5F/Ikf+ekE5Ew"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 2528,
    "path": "../public/assets/Sidebar-Bp3ymqpp.js"
  },
  "/assets/settings-DwvPRazv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ee-rnvvdjdjxfpFKCp1tTfntDaZO70"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 494,
    "path": "../public/assets/settings-DwvPRazv.js"
  },
  "/assets/sparkles-DN32eN_k.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fa-14R/K4IRFDBbVEvzstMnDdpOoCQ"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 506,
    "path": "../public/assets/sparkles-DN32eN_k.js"
  },
  "/assets/star-DtXoi24J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e4-zh6xXFDEGM1GMMcObTP1LGqN/rI"',
    "mtime": "2026-08-07T18:24:50.762Z",
    "size": 484,
    "path": "../public/assets/star-DtXoi24J.js"
  },
  "/assets/trash-2-DbreS0du.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"154-X1guA+iJER7yZj9fdPgP4PthE3E"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 340,
    "path": "../public/assets/trash-2-DbreS0du.js"
  },
  "/assets/trending-up-CnkoIQSn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb-rjAADHIcVkwpew8AkPc9B1oR9p0"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 187,
    "path": "../public/assets/trending-up-CnkoIQSn.js"
  },
  "/assets/user-round-DbY-jSFX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bd-25UdnVhfC0RGYnpqA6Hg5+dDjpc"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 189,
    "path": "../public/assets/user-round-DbY-jSFX.js"
  },
  "/assets/users-round-DDdVyrU-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"104-huZKJhVoXeOofRXbwN+VLRVevhU"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 260,
    "path": "../public/assets/users-round-DDdVyrU-.js"
  },
  "/assets/styles-CrtrE6lG.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"15c82-jhiEvZ/pPm4IVneQWm49QIsNmxs"',
    "mtime": "2026-08-07T18:24:50.761Z",
    "size": 89218,
    "path": "../public/assets/styles-CrtrE6lG.css"
  },
  "/assets/users-xgiOeyH3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13e-3s1WVG4Su8rQrdBMNqOYaQGjSdc"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 318,
    "path": "../public/assets/users-xgiOeyH3.js"
  },
  "/assets/useServerFn--YuPp8w9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"138-vEPhx3SEY4SuAip00wATH3sztlI"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 312,
    "path": "../public/assets/useServerFn--YuPp8w9.js"
  },
  "/assets/wallet-BWdx5rV1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12a-tomhOQN85joPwiEdLkk884msd/g"',
    "mtime": "2026-08-07T18:24:50.763Z",
    "size": 298,
    "path": "../public/assets/wallet-BWdx5rV1.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br",
  zstd: ".zst"
};
const _ob6uAk = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_8xLM8q = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_8xLM8q };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_ob6uAk)
].filter(Boolean);
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    middleware.push(...h3App["~middleware"]);
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const tracingSrvxPlugins = [];
const _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
const port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch,
  plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
const nodeServer = {};
export {
  nodeServer as default
};
