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
  "/assets/admin.agenda-kYv1qSEY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"20ae-2tdBv3JA3DF0AG9zo3CG8Jml2tU"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 8366,
    "path": "../public/assets/admin.agenda-kYv1qSEY.js"
  },
  "/assets/admin-IWSou6IH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4ab-jlOUU+k9vq1bSJqA26lEwSHIdiI"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 1195,
    "path": "../public/assets/admin-IWSou6IH.js"
  },
  "/assets/admin.clientes-BO51gB1r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"23bb-+vKvlNYtsW6bHm9SwcDYir/H6B8"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 9147,
    "path": "../public/assets/admin.clientes-BO51gB1r.js"
  },
  "/assets/admin.assinaturas-DgkKUqum.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"425b-TPOgQ+5xbhvZdo/LdMatNCebIDc"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 16987,
    "path": "../public/assets/admin.assinaturas-DgkKUqum.js"
  },
  "/assets/admin.bloqueios-JmWjnMgy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24cc-pm9/Oxv3zF8c81pRU3JmcAxr8iQ"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 9420,
    "path": "../public/assets/admin.bloqueios-JmWjnMgy.js"
  },
  "/assets/admin.configuracoes-gPYRFQwr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2481-ctnEVEzhhp3dfTyggE7UEb2zAN8"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 9345,
    "path": "../public/assets/admin.configuracoes-gPYRFQwr.js"
  },
  "/assets/admin.financeiro-Cd8uwk6g.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"674a-L3EkODvDSBnfVtziq7VkOlRWBUQ"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 26442,
    "path": "../public/assets/admin.financeiro-Cd8uwk6g.js"
  },
  "/assets/admin.marketing-BTEFbYRY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"cc9-x0CDWmYrjxEJxvFFSgwHQbnX8UA"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 3273,
    "path": "../public/assets/admin.marketing-BTEFbYRY.js"
  },
  "/assets/admin.index-DZ1tWl96.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"25b2-FHW9aJXJfmRYlsdevp1cqbpme3A"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 9650,
    "path": "../public/assets/admin.index-DZ1tWl96.js"
  },
  "/assets/admin.relatorios-CK79sBno.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4700-VFU1xPYYsaL4+H5SePgCA64fTAs"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 18176,
    "path": "../public/assets/admin.relatorios-CK79sBno.js"
  },
  "/assets/admin.usuarios-CP1xduGN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fd3-aVYjrZy8IYONONdM74Z8cQZCNm8"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 8147,
    "path": "../public/assets/admin.usuarios-CP1xduGN.js"
  },
  "/assets/agendamento.functions-BLS-TD7-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4c4-KH92Z4iI+HzWveke2RGvHTM5TiQ"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 1220,
    "path": "../public/assets/agendamento.functions-BLS-TD7-.js"
  },
  "/assets/arrow-right-C5xR336Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b1-bZg8b4CX5cXr4EZwMR/guK7hYoo"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 177,
    "path": "../public/assets/arrow-right-C5xR336Z.js"
  },
  "/assets/assinatura.functions-BpO7bUsf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3f7-YgH5DQo5BxlgGfvdedkiEPyrqfA"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 1015,
    "path": "../public/assets/assinatura.functions-BpO7bUsf.js"
  },
  "/assets/badge-cLl2zsxO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f3-iId+PbKtHjP62edYG7Hp1wgFkGs"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 755,
    "path": "../public/assets/badge-cLl2zsxO.js"
  },
  "/assets/bloqueio-agenda.functions-BgDew9x5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"17e-ebVcDEj8O5aKV02dCbnavEM1Cpw"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 382,
    "path": "../public/assets/bloqueio-agenda.functions-BgDew9x5.js"
  },
  "/assets/button-mjPBYC8y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7c1a-qF/B/W6YAhbQN1SmY4DLbb+Ui8Y"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 31770,
    "path": "../public/assets/button-mjPBYC8y.js"
  },
  "/assets/cadastro-Bv8VOPIb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a08-pV2d/Yzx54afAEQNPfT5BcDiv9I"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 2568,
    "path": "../public/assets/cadastro-Bv8VOPIb.js"
  },
  "/assets/calendar-BiNXdaeK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10d-wBGqSC40ywpSbbbwpXNzy46UqcA"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 269,
    "path": "../public/assets/calendar-BiNXdaeK.js"
  },
  "/assets/calendar-check-CeIoFYHq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13d-93uWrbCLMNlkZ3sSrPmBcIRKbMA"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 317,
    "path": "../public/assets/calendar-check-CeIoFYHq.js"
  },
  "/assets/calendar-clock-BzAHgYWH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"181-i/pq6Ic67+2mOHGaAQUCeBRp1zk"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 385,
    "path": "../public/assets/calendar-clock-BzAHgYWH.js"
  },
  "/assets/calendar-x-2-DSghghmE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"173-C8hlAM8/i6k16NYUTMXYQ7Fy5bE"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 371,
    "path": "../public/assets/calendar-x-2-DSghghmE.js"
  },
  "/assets/card-CmoWgJGG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3fb-TZnr6C6ZJmrrjs9SEY09zfxU724"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 1019,
    "path": "../public/assets/card-CmoWgJGG.js"
  },
  "/assets/catalogo.functions-DJMLYy-5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"38d-YMcol4zwzWDnlsoDB2+wKo5hvsc"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 909,
    "path": "../public/assets/catalogo.functions-DJMLYy-5.js"
  },
  "/assets/chart-column-CRPAj5Pc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"107-JihuDdaSlKkVMfvOa0B2XyKxo7E"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 263,
    "path": "../public/assets/chart-column-CRPAj5Pc.js"
  },
  "/assets/circle-check-DLTn5Bav.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b9-faraEEjDC21qQUEZgJwjctoIhNM"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 185,
    "path": "../public/assets/circle-check-DLTn5Bav.js"
  },
  "/assets/cliente-DCkNXKZY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"46c-95Pcm7pE4UsnXt00IqujmD4Gp04"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 1132,
    "path": "../public/assets/cliente-DCkNXKZY.js"
  },
  "/assets/circle-x-DWQro4Ij.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"d6-45Z2A8hP4b4VZbljRdC+ADrj0uY"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 214,
    "path": "../public/assets/circle-x-DWQro4Ij.js"
  },
  "/assets/cliente.beneficios-B1v169QL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"480-2pSkahJGEGz00ina3Zd9FXsaOo0"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 1152,
    "path": "../public/assets/cliente.beneficios-B1v169QL.js"
  },
  "/assets/cliente.fidelidade-W7Tvmv3o.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"18db-/rXkN71L28XJmYLokbkzn3PKBPs"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 6363,
    "path": "../public/assets/cliente.fidelidade-W7Tvmv3o.js"
  },
  "/assets/cliente.agendamentos-DW915gz5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fe5-6U3Wt3k8xpSf0CPcivEqYqRkNAM"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 12261,
    "path": "../public/assets/cliente.agendamentos-DW915gz5.js"
  },
  "/assets/cliente.assinatura-DaVJC0Ci.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e25-SICHedIQ1iff7fvgmqhkrygkCnw"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 7717,
    "path": "../public/assets/cliente.assinatura-DaVJC0Ci.js"
  },
  "/assets/cliente.historico-C7zMX1SI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1732-taKA81opSG/0OlP7bb+PBeZunUg"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 5938,
    "path": "../public/assets/cliente.historico-C7zMX1SI.js"
  },
  "/assets/cliente.index-HVTUn1Eg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1d63-tzH0rGZ1QXNEfa0ZIUOvr3VQQ8c"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 7523,
    "path": "../public/assets/cliente.index-HVTUn1Eg.js"
  },
  "/assets/createLucideIcon-tAmKXPYE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4b2-EN+Fv38Pwu7qudOS5lZIai7DZ6Y"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 1202,
    "path": "../public/assets/createLucideIcon-tAmKXPYE.js"
  },
  "/assets/credit-card-33tMeA-X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"db-CMNyNo03ZsiPZw0hCwyzNyDoZko"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 219,
    "path": "../public/assets/credit-card-33tMeA-X.js"
  },
  "/assets/cliente.perfil-B2b3RS3N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ac6-pgrFNF8rWPXDLBqqf1R45efQ+HY"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 2758,
    "path": "../public/assets/cliente.perfil-B2b3RS3N.js"
  },
  "/assets/clock-Bpvl1EYn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b0-aTnoZM7VubbBKUo7W95UfC3XTqo"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 176,
    "path": "../public/assets/clock-Bpvl1EYn.js"
  },
  "/assets/crown-CCONrFVV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"176-sr+kO+4j4HFDTe1suInAjk5qKLg"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 374,
    "path": "../public/assets/crown-CCONrFVV.js"
  },
  "/assets/dollar-sign-BOidBfQJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e7-isNVSzEmpmDQcTscs1QhhaoxmxA"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 231,
    "path": "../public/assets/dollar-sign-BOidBfQJ.js"
  },
  "/assets/file-chart-column-increasing-B9mIsGtr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a3-picqfj40ocl+HeRtGGPG+yR82eY"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 419,
    "path": "../public/assets/file-chart-column-increasing-B9mIsGtr.js"
  },
  "/assets/funcionario-WLS2o9SK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"401-tGGb8dJTzvqELc6Uj1ot7yWC1WE"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 1025,
    "path": "../public/assets/funcionario-WLS2o9SK.js"
  },
  "/assets/funcionario.bloqueios-DkbVPrYI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24cc-v7xpiN9JWKTf2iEbeZTei8kMfQA"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 9420,
    "path": "../public/assets/funcionario.bloqueios-DkbVPrYI.js"
  },
  "/assets/funcionario.solicitacoes-D_i7v-Ks.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"29ee-y6I7OR/9NelGSLaibXMThhxyfew"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 10734,
    "path": "../public/assets/funcionario.solicitacoes-D_i7v-Ks.js"
  },
  "/assets/funcionario.index-BAvj4iqa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13a1-zTHXZ125V65m4gaziBtVOgX/Zmw"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 5025,
    "path": "../public/assets/funcionario.index-BAvj4iqa.js"
  },
  "/assets/history-PDaBE1y8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f9-VNX4GasRsRKsUtRKsyzT4KGyD2s"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 249,
    "path": "../public/assets/history-PDaBE1y8.js"
  },
  "/assets/gift-BNT4W3DH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"169-R8Nl4FbXIQ6L70EK1NnCuvUSVQY"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 361,
    "path": "../public/assets/gift-BNT4W3DH.js"
  },
  "/assets/index-CeHarW4i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2f11-URYuzh2wSLSGUMWuLNL7ULs20CI"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 12049,
    "path": "../public/assets/index-CeHarW4i.js"
  },
  "/assets/input-CvBTEFYw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"24f-y8heI/Wy6NO6i3GeCECioVgMsq0"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 591,
    "path": "../public/assets/input-CvBTEFYw.js"
  },
  "/assets/index-B6X7s3yv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"592bd-GmZSo4gaBiz0OqHrhzq+KPCF8A4"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 365245,
    "path": "../public/assets/index-B6X7s3yv.js"
  },
  "/assets/label-SIciOcgH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"38a-WhaX9IvLM3XvAC2brLnF/X4oMpc"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 906,
    "path": "../public/assets/label-SIciOcgH.js"
  },
  "/assets/log-out-nyiPvsrK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2-7bEm2Bv1MY1Q88NymSon/JtdCE8"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 242,
    "path": "../public/assets/log-out-nyiPvsrK.js"
  },
  "/assets/layout-dashboard-osD7XgM-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"16b-ytCqwI/OYSJHopc8e4ZkBHAx97M"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 363,
    "path": "../public/assets/layout-dashboard-osD7XgM-.js"
  },
  "/assets/phone-BE7doivt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f3-WJsgMaCilabJXQccrVLr2J/gCzI"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 499,
    "path": "../public/assets/phone-BE7doivt.js"
  },
  "/assets/logout-CO9RIwZ_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"68b-pOu04LM7QHAjtkwTeeBeqzLr6Vw"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 1675,
    "path": "../public/assets/logout-CO9RIwZ_.js"
  },
  "/assets/login-C5oNQnFb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"988-6IzPQ8C8d//kBzci+1FreDZD0ag"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 2440,
    "path": "../public/assets/login-C5oNQnFb.js"
  },
  "/assets/plus-BOioQLF4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a5-XdsJqdLpMXjOm9AemEmd6YN1wOY"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 165,
    "path": "../public/assets/plus-BOioQLF4.js"
  },
  "/assets/receipt-CSUitjgg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"130-HX/NS/m5SIvS7wknLneVRe+SXNc"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 304,
    "path": "../public/assets/receipt-CSUitjgg.js"
  },
  "/assets/refresh-cw-DK76GRmG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"14d-Y908EEnAvWzTZbHV0zHbwwlmICQ"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 333,
    "path": "../public/assets/refresh-cw-DK76GRmG.js"
  },
  "/assets/scissors-CwV1Hepd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13e-GAMkdN7N2XZ7tSusUNdZolSCk2c"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 318,
    "path": "../public/assets/scissors-CwV1Hepd.js"
  },
  "/assets/settings-D1znEgz_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ee-1NiQbR3avUZ2m++G2OjSoT3s80g"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 494,
    "path": "../public/assets/settings-D1znEgz_.js"
  },
  "/assets/shield-check-1xYl8GSs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"147-LGjOhxiXA30VPpyjH/XjWCNEw/0"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 327,
    "path": "../public/assets/shield-check-1xYl8GSs.js"
  },
  "/assets/sparkles-CNEhKcMn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fa-aL/N+JzvZN+iYEcOH/H0MHq7MiM"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 506,
    "path": "../public/assets/sparkles-CNEhKcMn.js"
  },
  "/assets/Sidebar-9chU7aTq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9e0-U4WNGVjHrUCKU2zY+nh2+Xg3ShQ"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 2528,
    "path": "../public/assets/Sidebar-9chU7aTq.js"
  },
  "/assets/star-Dk_31C-e.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1e4-IQivf3Nym+DuFFhbwHetzNM+lxo"',
    "mtime": "2026-08-03T23:43:44.608Z",
    "size": 484,
    "path": "../public/assets/star-Dk_31C-e.js"
  },
  "/assets/trash-2-Cpy0-Gsk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"154-lBuKvhRpE6A5C5W+AAAFlJGYvdQ"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 340,
    "path": "../public/assets/trash-2-Cpy0-Gsk.js"
  },
  "/assets/trending-up-KkdH-DhF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bb-zpmFWCOKl3OdceS0lGvPyagqfRo"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 187,
    "path": "../public/assets/trending-up-KkdH-DhF.js"
  },
  "/assets/user-round-qmTImV3S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"bd-zLBt3ogaRZ/TAoCHr5AqQd501og"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 189,
    "path": "../public/assets/user-round-qmTImV3S.js"
  },
  "/assets/styles-Cloc8BGF.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"157a7-wXCI1JWGKChZjd1diuFoPTsslQQ"',
    "mtime": "2026-08-03T23:43:44.596Z",
    "size": 87975,
    "path": "../public/assets/styles-Cloc8BGF.css"
  },
  "/assets/users-CslCL0lg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13e-t7nFIhXBk+anF8u7mqEYswGOahk"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 318,
    "path": "../public/assets/users-CslCL0lg.js"
  },
  "/assets/users-round-B6QylrTc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"104-76b9eAdZ7QcL14qUxRA6QMXypz8"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 260,
    "path": "../public/assets/users-round-B6QylrTc.js"
  },
  "/assets/useServerFn-oKYUM7c3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"138-2w+BoAAu0kUrp2opeHcdKFJh2AE"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 312,
    "path": "../public/assets/useServerFn-oKYUM7c3.js"
  },
  "/assets/wallet-BNLVxHMP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12a-qNGt/K4v9NbgBsykBjDdbrb3XKE"',
    "mtime": "2026-08-03T23:43:44.609Z",
    "size": 298,
    "path": "../public/assets/wallet-BNLVxHMP.js"
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
