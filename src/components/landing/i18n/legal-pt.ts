import type { LegalDictionary } from "./legal-en";

const pt: LegalDictionary = {
  updated: "5 de agosto de 2026",
  updatedLabel: "Última atualização",
  backToHome: "Voltar ao início",
  controllerHeading: "Quem é o responsável",
  controllerNameLabel: "Responsável",
  controllerEmailLabel: "Contacto",
  controllerCountryLabel: "País",

  privacy: {
    metaTitle: "Política de Privacidade — Bikit",
    metaDescription: "O que o Bikit guarda sobre ti, porquê, e o que podes fazer quanto a isso.",
    title: "Política de Privacidade",
    intro: [
      "O Bikit é uma aplicação de manutenção de bicicletas mantida por uma pessoa, não por uma empresa. Esta política explica o que guarda sobre ti, porque o guarda, e o que podes fazer quanto a isso.",
      "Aplica-se ao bikit.app e à aplicação Bikit instalada no teu dispositivo.",
    ],
    sections: [
      {
        heading: "O que o Bikit guarda",
        body: [
          "Apenas o que a aplicação precisa para funcionar. Tudo o que se segue foi escrito por ti ou devolvido por um serviço que escolheste ligar.",
        ],
        bullets: [
          "Conta — o teu email, o teu nome se o tiveres indicado, e as tuas preferências: idioma, unidade de distância e definições de notificação. A palavra-passe é guardada em hash com sal e o Bikit nunca a vê.",
          "Entrar com a Google — se a usares, a Google envia o teu nome, o teu email e um identificador estável da conta. A tua palavra-passe da Google nunca é partilhada com o Bikit.",
          "As tuas bicicletas — nome, marca, modelo, ano, tipo, cor, número de série, tamanho de quadro e de roda, data de compra, garantia, fotografia e notas. Tudo é opcional exceto a própria bicicleta.",
          "Os teus componentes e manutenções — categoria, marca, modelo, número de série, data de instalação, os lembretes que configuraste, e cada serviço, reparação ou substituição que registas, com data, notas e a quilometragem do momento.",
          "Totais de utilização — os quilómetros e as horas de cada bicicleta, introduzidos por ti ou sincronizados do Strava.",
          "Strava, se o ligares — o teu identificador de atleta, os tokens necessários para sincronizar, e por cada volta associada a uma das tuas bicicletas o identificador da atividade, a distância e o tempo em movimento. O Bikit não pede nem guarda percursos, traçados de GPS, frequência cardíaca, potência ou qualquer outro dado da volta.",
          "Notificações push, se as ativares — o endereço que o teu browser atribui a esse dispositivo, as chaves de encriptação que lhe pertencem, e o user agent do dispositivo.",
          "Pagamentos, se subscreveres — os identificadores de cliente e de subscrição no Stripe, o teu plano e o estado dele. Os dados do cartão nunca chegam ao Bikit: o pagamento acontece nas páginas do próprio Stripe.",
          "Histórico de notificações — que alertas de manutenção foram enviados e quando, para o mesmo alerta não te chegar duas vezes.",
        ],
      },
      {
        heading: "Para que serve",
        body: [
          "Para prestar o serviço que subscreveste: guardar as tuas bicicletas e o seu historial, calcular quando um componente precisa de serviço, enviar os alertas que pediste, e tratar da tua subscrição se tiveres uma.",
          "É esta a lista inteira. O Bikit não vende os teus dados, não os partilha para publicidade, não constrói perfis publicitários, e não tem qualquer script de análise ou rastreio de terceiros.",
        ],
      },
      {
        heading: "Fundamentos legais",
        body: ["Ao abrigo do RGPD, cada utilização dos teus dados assenta num destes fundamentos:"],
        bullets: [
          "Execução de um contrato — a tua conta, os teus dados e as funcionalidades centrais de manutenção. Sem isto não há serviço.",
          "Consentimento — ligar o Strava, ativar as notificações push, e o resumo semanal por email. Podes retirar qualquer um deles a qualquer momento nas Definições, sem afetar os restantes.",
          "Obrigação legal — conservar registos de faturação durante o prazo exigido pela lei fiscal.",
          "Interesse legítimo — manter o serviço seguro e prevenir abusos.",
        ],
      },
      {
        heading: "Quem mais trata os teus dados",
        body: [
          "O Bikit assenta em serviços que necessariamente tratam parte dos teus dados por sua conta. Cada um serve um único propósito:",
        ],
        bullets: [
          "Supabase — a base de dados e o sistema de autenticação. É aqui que vivem os teus dados.",
          "Vercel — alojamento e entrega do site.",
          "Stripe — pagamento de subscrições, apenas se subscreveres.",
          "Resend — entrega dos emails que o Bikit te envia.",
          "Google — autenticação, apenas se a escolheres.",
          "Strava — sincronização de voltas, apenas se o ligares.",
          "Serviços de push da Apple, Google e Mozilla — entrega das notificações ao teu dispositivo, apenas se as ativares. Recebem a notificação encriptada e o endereço do dispositivo, nunca a tua conta.",
        ],
      },
      {
        heading: "Onde ficam os teus dados",
        body: [
          "A base de dados está alojada na Irlanda e os teus dados permanecem na União Europeia.",
          "Alguns dos serviços acima têm sede fora da UE e podem tratar dados aí. Quando isso acontece, é ao abrigo das garantias que esses fornecedores publicam, como as cláusulas contratuais-tipo da Comissão Europeia.",
        ],
      },
      {
        heading: "Durante quanto tempo",
        body: [
          "Enquanto a tua conta existir. Apagas uma bicicleta, um componente ou um serviço na aplicação e ele desaparece da base de dados; apagas a conta e vai tudo o que lhe está ligado.",
          "Os registos de faturação à guarda do Stripe são conservados pelo prazo que a lei fiscal exigir, independentemente da tua conta Bikit.",
        ],
      },
      {
        heading: "Os teus direitos",
        body: [
          "Podes pedir uma cópia dos teus dados, corrigi-los, apagá-los, pedir que sejam enviados para outro lado, opor-te a determinada utilização, ou retirar um consentimento que deste. A maior parte disto fazes tu na aplicação; para o resto, escreve para o endereço acima e terás resposta em 30 dias.",
          "Se achares que os teus dados foram mal tratados, podes reclamar junto da Comissão Nacional de Proteção de Dados (CNPD, em cnpd.pt) ou da autoridade equivalente do país onde vives.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "O Bikit usa dois cookies e nenhum deles serve para rastrear: o cookie de sessão que te mantém com sessão iniciada, e um que se lembra do idioma que escolheste na página inicial. A preferência de tema claro ou escuro fica no armazenamento do próprio browser e nunca é enviada para lado nenhum. Não há cookies de publicidade nem de análise.",
        ],
      },
      {
        heading: "Menores",
        body: [
          "O Bikit não se destina a menores de 16 anos, e não devem ser criadas contas em nome deles.",
        ],
      },
      {
        heading: "Alterações a esta política",
        body: [
          "Se esta política mudar, a data no topo muda com ela. Quando a alteração te afetar de forma relevante, serás avisado por email antes de produzir efeitos.",
        ],
      },
    ],
  },

  terms: {
    metaTitle: "Termos de Serviço — Bikit",
    metaDescription: "O acordo entre ti e o Bikit.",
    title: "Termos de Serviço",
    intro: [
      "Estes termos são o acordo entre ti e a pessoa que mantém o Bikit. Usar a aplicação significa aceitá-los.",
    ],
    sections: [
      {
        heading: "O que é o Bikit",
        body: [
          "O Bikit é uma ferramenta para registares as tuas bicicletas, os seus componentes e a sua manutenção, e para te lembrar quando um serviço está a chegar. É uma ferramenta de registo e de lembretes, e nada além disso.",
        ],
      },
      {
        heading: "O Bikit não inspeciona a tua bicicleta",
        body: [
          "Todos os alertas que o Bikit mostra são aritmética sobre números que forneceste: um intervalo que escolheste, medido contra distância ou tempo que tu ou o Strava reportaram. Não tem forma nenhuma de saber o estado real de uma peça.",
          "Um componente pode falhar muito antes de o intervalo acabar, e um componente com o intervalo ultrapassado pode estar perfeitamente bem. Não trates uma barra verde cheia como uma verificação de segurança. Se a peça é relevante para a tua segurança — travões, direção, quadro, garfo — manda-a inspecionar por quem sabe.",
        ],
      },
      {
        heading: "A tua conta",
        body: [
          "Precisas de ter pelo menos 16 anos para teres conta. Guarda as tuas credenciais para ti: o que for feito através da tua conta é tratado como tendo sido feito por ti. Se achares que alguém entrou nela, diz de imediato.",
        ],
      },
      {
        heading: "Planos e pagamento",
        body: [
          "O Bikit tem um plano gratuito e dois planos pagos: Pessoal a 2,99 € por mês e Pro a 7,99 € por mês. O preço é sempre mostrado antes de confirmares.",
          "Os planos pagos renovam todos os meses até cancelares. Cancelar impede a renovação seguinte e ficas com as funcionalidades pagas até ao fim do período que já pagaste. Os pagamentos são tratados pelo Stripe; os dados do cartão nunca chegam ao Bikit.",
          "Como consumidor na UE tens 14 dias para mudares de ideias sobre uma subscrição. Pede dentro desse prazo e o dinheiro é devolvido.",
        ],
      },
      {
        heading: "O que introduzes continua teu",
        body: [
          "As bicicletas, componentes, serviços e notas que registas pertencem-te. O Bikit guarda-os para tos mostrar de volta e não reivindica quaisquer direitos sobre eles. Podes apagá-los quando quiseres, ou pedir uma cópia.",
        ],
      },
      {
        heading: "O que não podes fazer",
        body: ["Há coisas que ficam de fora:"],
        bullets: [
          "Tentar aceder a contas ou dados de outras pessoas.",
          "Sobrecarregar, sondar ou perturbar o serviço.",
          "Revender o Bikit ou fazê-lo passar por teu.",
          "Usá-lo para algo ilícito.",
        ],
      },
      {
        heading: "Strava",
        body: [
          "Ligar o Strava é opcional e rege-se também pelos termos do próprio Strava. O Bikit lê as atividades de que precisa para manter a tua quilometragem atualizada, e mais nada. Podes desligar quando quiseres nas Definições; os dados já registados no Bikit ficam onde estão.",
        ],
      },
      {
        heading: "Disponibilidade e responsabilidade",
        body: [
          "O Bikit é um projeto pessoal mantido por uma pessoa. É cuidado com atenção, mas não vem com promessa de disponibilidade, nem tempo de resposta garantido, nem garantia de estar isento de falhas. Funcionalidades podem mudar ou ser retiradas.",
          "Nada aqui limita a responsabilidade por morte ou danos pessoais causados por negligência, nem por dolo — a lei não permite excluí-las. Fora isso, e na medida em que a lei o permita, a responsabilidade fica limitada ao valor que pagaste nos doze meses anteriores ao problema.",
        ],
      },
      {
        heading: "Terminar",
        body: [
          "Podes apagar a tua conta quando quiseres. Uma conta pode ser suspensa ou encerrada se estes termos forem violados de forma grave ou repetida; sempre que for razoável, serás avisado primeiro e terás oportunidade de corrigir.",
        ],
      },
      {
        heading: "Alterações a estes termos",
        body: [
          "Estes termos podem mudar. A data no topo muda com eles, e alterações relevantes serão anunciadas por email antes de produzirem efeitos. Continuar a usar o Bikit depois disso significa aceitar a versão nova.",
        ],
      },
      {
        heading: "Lei aplicável e litígios",
        body: [
          "Aplica-se a lei portuguesa. Isto não te retira a proteção que a lei do consumo do país onde vives te dá.",
          "Se algo correr mal, escreve primeiro — quase tudo se resolve assim. Enquanto consumidor podes também recorrer à plataforma de resolução de litígios em linha da Comissão Europeia ou à entidade de resolução alternativa de litígios da tua área.",
        ],
      },
    ],
  },
};

export default pt;
