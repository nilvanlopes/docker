// Feitos adicionais transcritos e resumidos a partir do capítulo 4 do livro.
export const additionalFeats = [
  {
    name: "Adaptação ao Ambiente", ranks: 1, category: "Geral",
    benefit: "Ignora penalidades de um ambiente específico.",
    description: "Escolha um ambiente específico, como gravidade zero ou ambiente submarino. Você age e se desloca normalmente nele, sem sofrer as penalidades ambientais; isso não protege contra perigos como sufocamento ou exposição.",
  },
  {
    name: "Ambidestria", ranks: 1, category: "Geral",
    benefit: "Elimina penalidades por usar a mão inábil.",
    description: "Você usa qualquer mão com a mesma habilidade e ignora penalidades por mão inábil em testes e ataques. O feito não concede ataques adicionais; se tiver mais de duas mãos, aplica-se a todas.",
  },
  {
    name: "Ambiente Favorito", ranks: 5, category: "Combate",
    benefit: "+1 em ataque ou esquiva por graduação no ambiente escolhido.",
    description: "Escolha um ambiente, como floresta, espaço ou calor extremo. Enquanto estiver nele, no início de cada rodada escolha receber +1 em rolagens de ataque ou na esquiva por graduação. Os limites de ataque e Defesa do nível de poder continuam valendo.",
  },
  {
    name: "Armação", ranks: 1, category: "Combate",
    benefit: "Transfere para um aliado o benefício de uma perícia de interação em combate.",
    description: "Quando usa uma perícia de interação em combate, você pode preparar um colega para aproveitar o resultado. Por exemplo, pode fintar e permitir que o aliado faça o ataque surpresa. A ação e o teste da perícia ainda consomem seu tempo normalmente.",
  },
  {
    name: "Artífice", ranks: 1, category: "Perícia",
    benefit: "Cria dispositivos mágicos temporários com Conhecimento (arcano) e Ofício.",
    description: "Você pode usar Conhecimento (arcano) e Ofício para criar dispositivos mágicos temporários, seguindo as regras de invenções mágicas do jogo.",
  },
  {
    name: "Assustar", ranks: 1, category: "Perícia",
    benefit: "Usa Intimidar no lugar de Blefar para fintar em combate.",
    description: "Você pode fazer fintas em combate com Intimidar em vez de Blefar. O alvo resiste com Intimidação, Intuir Intenção ou Vontade, usando o melhor resultado aplicável; tentativas repetidas contra o mesmo alvo no encontro aumentam a resistência em +1 por tentativa.",
  },
  {
    name: "Ataque Furtivo", ranks: 5, category: "Combate",
    benefit: "+2 de dano por graduação contra alvos surpreendidos.",
    description: "Quando atinge um oponente surpreendido, você causa +2 de dano por graduação neste feito. O bônus aplica-se apenas aos ataques que realmente surpreendem o alvo e continua sujeito aos limites de nível de poder.",
  },
  {
    name: "Atraente", ranks: 5, category: "Perícia",
    benefit: "+4 por graduação em Blefar e Diplomacia com quem se sente atraído por você.",
    description: "Receba +4 por graduação em testes de Blefar e Diplomacia para enganar, seduzir ou mudar a postura de alguém que possa se sentir atraído por você. O bônus não pode elevar sua graduação efetiva acima do limite de nível de poder.",
  },
  {
    name: "Atropelar Aprimorado", ranks: 1, category: "Combate",
    benefit: "+4 para derrubar ao atropelar; o alvo não pode escolher evitar.",
    description: "Quando tenta atropelar um oponente, ele não pode escolher evitá-lo. Você recebe +4 no teste para derrubá-lo.",
  },
  {
    name: "Atropelar Rápido", ranks: 1, category: "Combate",
    benefit: "Permite continuar atropelando outros alvos durante o movimento.",
    description: "Após um atropelamento bem-sucedido, você pode tentar atropelar outro alvo se ainda tiver movimento. Continue até falhar ou ficar sem deslocamento; antes de cada nova tentativa, percorra ao menos 3 m em linha reta. Você pode mudar a direção entre tentativas.",
  },
  {
    name: "Avaliação", ranks: 1, category: "Geral",
    benefit: "Compara ataque e Defesa de um alvo aos seus.",
    description: "Como ação de movimento, escolha alguém que possa perceber e faça um teste oposto de Intuir Intenção contra Blefar. Se vencer, o mestre informa se o bônus de ataque e a Defesa do alvo são maiores, iguais ou menores que os seus, sem revelar os valores exatos. Em uma falha, a informação é enganosa.",
  },
  {
    name: "Bem-Informado", ranks: 1, category: "Perícia",
    benefit: "Pesquisa imediatamente o que já sabe sobre alguém ou uma organização.",
    description: "Ao encontrar pela primeira vez uma pessoa ou organização, você pode fazer como reação um teste de Obter Informação para saber se já ouviu falar dela. Isso substitui o teste normal de Conhecimento, quando aplicável. Você recebe um teste por assunto, salvo se o mestre permitir nova tentativa após uma mudança significativa.",
  },
  {
    name: "Bem-Relacionado", ranks: 1, category: "Perícia",
    benefit: "Consegue favores por meio de contatos usando Diplomacia.",
    description: "Você pode pedir conselhos, informações ou acesso a recursos fazendo um teste de Diplomacia; o mestre define a CD conforme o favor. Um ponto heroico pode garantir automaticamente o favor. Pedidos podem ser vetados se forem inviáveis ou prejudicarem a trama, e normalmente exigem alguns minutos e um meio de contatar seus conhecidos.",
  },
  {
    name: "Benefício", ranks: 5, category: "Geral",
    benefit: "Concede um direito ou vantagem significativa aprovada pelo mestre.",
    description: "Escolha com o mestre uma vantagem significativa, como autorização de segurança, identidade alternativa, imunidade diplomática, status especial ou riqueza. Cada graduação deve valer aproximadamente outro feito ou um poder de 1 ponto; benefícios mais fortes podem exigir graduações adicionais. O mestre decide o que é adequado à campanha.",
  },
  {
    name: "Blefe Acrobático", ranks: 1, category: "Perícia",
    benefit: "Usa Acrobacia no lugar de Blefar para fintas e truques em combate.",
    description: "Você pode usar Acrobacia em vez de Blefar para fintar ou realizar truques em combate. O oponente resiste com Intuir Intenção ou Acrobacia, escolhendo o melhor bônus.",
  },
  {
    name: "Capangas", ranks: 5, category: "Geral",
    benefit: "Concede seguidores cujos pontos dependem das graduações.",
    description: "Você tem capangas com pontos de poder iguais a 15 por graduação, sujeitos aos limites de nível de poder e controlados pelo mestre. Pagando o dobro, eles são fanáticos. Em vez de aumentar os pontos de um capanga, uma graduação pode aumentar a quantidade de capangas semelhantes conforme a Tabela de Progressão Universal. Capangas perdidos podem ser substituídos entre aventuras, a critério do mestre.",
  },
  {
    name: "Contatos", ranks: 1, category: "Perícia",
    benefit: "Obtém informação rapidamente por meio de uma rede de contatos.",
    description: "Se puder contatar sua rede, faça um teste de Obter Informação em um minuto. Você pode escolher 10 ou 20; escolher 20 leva 20 minutos. Novos testes sobre o mesmo assunto ainda exigem o tempo normal.",
  },
  {
    name: "Crítico Aprimorado", ranks: 5, category: "Combate",
    benefit: "Amplia a margem de ameaça de crítico de um ataque escolhido.",
    description: "Escolha um ataque ao adquirir cada graduação: ele obtém um acerto crítico com rolagem natural 19 ou 20. Somente um 20 natural acerta automaticamente, e uma rolagem que erre não é crítico. Graduações adicionais podem afetar ataques diferentes ou ampliar novamente a margem de um ataque escolhido.",
  },
  {
    name: "Desarmar Aprimorado", ranks: 5, category: "Combate",
    benefit: "+2 por graduação para desarmar; o alvo não pode desarmá-lo durante a tentativa.",
    description: "Receba +2 por graduação nas rolagens de ataque para desarmar um oponente. Ele não tem a oportunidade de desarmá-lo em resposta.",
  },
  {
    name: "Distrair", ranks: 2, category: "Perícia",
    benefit: "Deixa um oponente tonto por uma rodada com Blefar ou Intimidar.",
    description: "Escolha Blefar ou Intimidar ao adquirir o feito. Como ação padrão, teste essa perícia contra o melhor entre o teste oposto da mesma perícia, Intuir Intenção ou Vontade do alvo. Se vencer, ele fica tonto por uma rodada. Cada tentativa contra ele no mesmo encontro concede +1 para resistir; você pode adquirir o feito duas vezes, uma para cada perícia.",
  },
  {
    name: "Empatia com Animais", ranks: 1, category: "Perícia",
    benefit: "Usa Lidar com Animais como Diplomacia e interage com animais sem idioma comum.",
    description: "Use Lidar com Animais como Diplomacia para mudar a postura de animais com Inteligência 1 ou 2. Você comunica intenções por gestos e linguagem corporal, sem precisar falar um idioma que entendam, e também pode usar Blefar e Obter Informação com animais. O mestre pode aprovar versões para outras criaturas incomuns.",
  },
  {
    name: "Equipamento", ranks: 5, category: "Geral",
    benefit: "Concede 5 pontos para comprar equipamento por graduação.",
    description: "Você recebe 5 pontos de equipamento por graduação para gastar conforme as regras de equipamento da campanha.",
  },
  {
    name: "Esconder-se à Plena Vista", ranks: 1, category: "Perícia",
    benefit: "Permite usar Furtividade mesmo observado e sem cobertura ou camuflagem.",
    description: "Você pode fazer testes de Furtividade enquanto está sendo observado e mesmo sem cobertura ou camuflagem, situações que normalmente impediriam a tentativa.",
  },
  {
    name: "Esforço Supremo", ranks: 5, category: "Geral",
    benefit: "Gasta ponto heroico para tratar uma rolagem específica como 20.",
    description: "Escolha uma tarefa específica ao adquirir o feito. Ao gastar um ponto heroico nela, trate o dado como resultado 20, sem rolar; isso não é um 20 natural. Cada aquisição pode se aplicar a uma tarefa diferente, como um ataque após mirar ou um tipo específico de salvamento.",
  },
  {
    name: "Estrangular", ranks: 1, category: "Combate",
    benefit: "Faz um oponente imobilizado começar a sufocar.",
    description: "Quando imobiliza um oponente em uma manobra de agarrar, você pode estrangulá-lo. Ele começa a sufocar enquanto permanecer imobilizado.",
  },
  {
    name: "Fascinar", ranks: 4, category: "Perícia",
    benefit: "Prende a atenção de um alvo com uma perícia de interação escolhida.",
    description: "Escolha Blefar, Diplomacia, Intimidar ou Performance. Com uma ação padrão, teste a perícia contra o melhor entre a perícia oposta, Intuir Intenção ou Vontade do alvo. Se vencer, ele fica fascinado; manter o efeito exige uma ação padrão por rodada. Combate ou perigo imediato encerra o efeito. Você pode afetar um grupo, desde que todos recebam o mesmo efeito.",
  },
  {
    name: "Ferramentas Improvisadas", ranks: 1, category: "Perícia",
    benefit: "Ignora a penalidade por usar perícias sem as ferramentas apropriadas.",
    description: "Você improvisa ferramentas com materiais disponíveis e ignora a penalidade normal de -4 por não ter as ferramentas apropriadas para uma perícia.",
  },
  {
    name: "Foco em Ataque", ranks: 5, category: "Combate",
    benefit: "+1 por graduação em um tipo de ataque escolhido.",
    description: "Escolha ataques corpo a corpo ou à distância. Você recebe +1 por graduação nas rolagens de ataque desse tipo, até o limite imposto pelo nível de poder da campanha.",
  },
  {
    name: "Foco em Esquiva", ranks: 5, category: "Combate",
    benefit: "+1 por graduação no bônus de esquiva.",
    description: "Receba +1 por graduação no bônus de esquiva. Você perde esse bônus sempre que não puder usar seu bônus de esquiva; a Defesa total continua limitada pelo nível de poder da campanha.",
  },
  {
    name: "Fúria", ranks: 4, category: "Combate",
    benefit: "Entra em fúria e recebe bônus físicos temporários, com penalidade na Defesa.",
    description: "Como ação livre, entre em fúria por cinco rodadas: recebe +4 em Força, +2 em Fortitude e Vontade, e -2 na Defesa. Não pode usar perícias ou poderes que exijam concentração nem escolher 10 ou 20; depois fica fatigado por cinco rodadas. Graduações adicionais aumentam Força em +2 e os salvamentos em +1, até quatro graduações, ou podem prolongar a fúria em cinco rodadas, prolongando igualmente a fadiga. Os bônus respeitam o limite de nível de poder.",
  },
  {
    name: "Golpe Crítico", ranks: 1, category: "Combate",
    benefit: "Permite acertar criticamente alvos imunes a acertos críticos.",
    description: "Contra seu Oponente Favorito, você pode obter acertos críticos mesmo que o alvo tenha Imunidade a acertos críticos. É necessário possuir Oponente Favorito.",
  },
  {
    name: "Inspirar", ranks: 5, category: "Fortuna",
    benefit: "Gasta ponto heroico para conceder bônus a aliados por graduação.",
    description: "Você deve poder interagir com os aliados afetados, até um número igual ao seu bônus de Carisma. Com uma ação completa e gastando um ponto heroico, concede +1 por graduação (máximo +5) a ataques, salvamentos e testes deles na rodada seguinte. Você não recebe o bônus; usos múltiplos não se acumulam, e o bônus pode ultrapassar os limites de nível de poder.",
  },
  {
    name: "Iniciativa Aprimorada", ranks: 5, category: "Combate",
    benefit: "+4 por graduação em testes de Iniciativa.",
    description: "Receba +4 por graduação nos testes de Iniciativa.",
  },
  {
    name: "Liderança", ranks: 1, category: "Fortuna",
    benefit: "Gasta ponto heroico para remover uma condição de um aliado.",
    description: "Como ação padrão, gaste um ponto heroico e remova de um aliado com quem possa interagir uma destas condições: abalado, atordoado, fascinado, fatigado, tonto ou em pânico. Não remove dano nem condições como exausto, desabilitado ou inconsciente.",
  },
  {
    name: "Luta no Chão", ranks: 1, category: "Combate",
    benefit: "Combate caído sem penalidades e pode rastejar mais rápido.",
    description: "Você não sofre penalidades nas rolagens de ataque por estar derrubado, e oponentes adjacentes não recebem bônus para atingi-lo. Ao rastejar, move-se até metade da velocidade em vez de apenas 1,5 m por ação de movimento.",
  },
  {
    name: "Maestria em Arremesso", ranks: 5, category: "Combate",
    benefit: "+1 por graduação no dano de armas arremessadas e permite improvisar armas.",
    description: "Receba +1 por graduação no dano com armas arremessadas. Você também pode usar objetos normalmente inofensivos como armas, com dano igual às graduações e incremento de alcance de 3 m. O dano continua sujeito ao limite de nível de poder.",
  },
  {
    name: "Maestria em Perícia", ranks: 5, category: "Perícia",
    benefit: "Escolhe 10 mesmo distraído ou sob pressão em quatro perícias por graduação.",
    description: "Escolha quatro perícias por graduação. Em testes dessas perícias, você pode escolher 10 mesmo distraído ou sob pressão, desde que a perícia permita escolher 10 normalmente.",
  },
  {
    name: "Memória Eidética", ranks: 1, category: "Geral",
    benefit: "+4 para recordar e permite testes destreinados de Conhecimento.",
    description: "Você recorda perfeitamente o que vivenciou e recebe +4 em testes para lembrar, inclusive salvamentos contra efeitos que alterem ou apaguem memórias. Pode fazer testes destreinados de Conhecimento para responder perguntas difíceis ou obscuras.",
  },
  {
    name: "Mira Aprimorada", ranks: 1, category: "Combate",
    benefit: "Dobra os bônus normais da ação Mirar.",
    description: "Ao usar uma ação completa para mirar, recebe o dobro do bônus normal: +10 em ataque corpo a corpo ou à distância adjacente ao alvo, e +4 em um ataque a maior distância.",
  },
  {
    name: "Mudança Rápida", ranks: 2, category: "Geral",
    benefit: "Troca de roupa como ação livre; uma segunda graduação amplia as opções.",
    description: "Você pode trocar para seu uniforme ou identidade secreta como ação livre. Com uma segunda graduação, pode mudar para qualquer roupa e usar Disfarce como ação de movimento.",
  },
  {
    name: "Oponente Favorito", ranks: 5, category: "Combate",
    benefit: "Recebe bônus contra uma categoria específica de oponentes.",
    description: "Escolha uma categoria aprovada pelo mestre. Receba +1 por graduação em Blefar, Intimidar, Intuir Intenção, Notar e Sobrevivência contra ela, além de dano nos ataques. Graduações podem escolher novos tipos ou aumentar o bônus contra um já escolhido, até +5; o dano respeita o limite de nível de poder.",
  },
  {
    name: "Parceiro", ranks: 5, category: "Geral",
    benefit: "Concede um aliado controlado pelo mestre, com pontos conforme as graduações.",
    description: "Você tem um parceiro, um PNJ leal com pontos de poder iguais a cinco por graduação e abaixo dos seus, sujeito aos limites da campanha. Graduações adicionais aumentam os pontos do parceiro ou a quantidade de parceiros conforme a progressão universal. Parceiros não têm pontos heroicos; você pode gastar os seus por eles. O mestre decide suas ações e pode limitar a quantidade.",
  },
  {
    name: "Plano Genial", ranks: 1, category: "Geral",
    benefit: "Planejamento concede bônus temporários a você e seus aliados.",
    description: "Com alguns minutos para preparar um encontro, faça um teste de Inteligência CD 10. Se tiver sucesso, você e seus aliados recebem bônus em ataques e perícias durante o encontro: +1 com resultado 10–14, +2 com 15–24 ou +3 com 25 ou mais. Você escolhe quando iniciar o plano; dura três rodadas e depois diminui em 1 por rodada até acabar. Não está sujeito ao limite de nível de poder.",
  },
  {
    name: "Presença Aterradora", ranks: 5, category: "Geral",
    benefit: "Ameaça criaturas próximas com um salvamento de Vontade.",
    description: "Como ação padrão, faça uma ameaça ou pose assustadora. Criaturas capazes de interagir com você num raio de 1,5 m por graduação fazem salvamento de Vontade CD 10 + graduações. Falha deixa o alvo abalado; falhar por 5 o apavora, e por 10 o faz entrar em pânico e fugir. As graduações não podem exceder seu bônus de Intimidar.",
  },
  {
    name: "Rastrear", ranks: 1, category: "Perícia",
    benefit: "Usa Sobrevivência para seguir rastros visualmente.",
    description: "Você pode seguir rastros com Sobrevivência como se possuísse o Super-Sentido rastrear.",
  },
  {
    name: "Redirecionar", ranks: 1, category: "Combate",
    benefit: "Redireciona contra outro alvo um ataque que errou você.",
    description: "Após vencer um truque contra um oponente, use uma reação para redirecionar para outro alvo um ataque dele que erre você. O novo alvo deve estar adjacente a você e dentro do alcance; o atacante faz nova rolagem com os mesmos modificadores.",
  },
  {
    name: "Rolamento Defensivo", ranks: 5, category: "Combate",
    benefit: "Adiciona graduações aos salvamentos de Resistência enquanto puder se esquivar.",
    description: "Receba bônus nos salvamentos de Resistência igual às graduações. Você perde esse bônus se perder o bônus de esquiva ou não puder agir livremente, salvo sucesso em Concentração contra CD definida pelas circunstâncias. Pode aplicar as graduações a Reflexo contra ataques de área ou à Resistência contra o dano resultante, mas não a ambos. O bônus total é limitado pelo nível de poder.",
  },
  {
    name: "Segunda Chance", ranks: 5, category: "Geral",
    benefit: "Permite repetir um teste ou salvamento contra um perigo escolhido.",
    description: "Escolha um perigo ou perícia apropriados com o mestre. Quando falhar no salvamento ou teste correspondente, role novamente e use o melhor resultado. Há apenas uma segunda tentativa por tarefa; cada graduação adicional aplica-se a outro perigo ou perícia.",
  },
  {
    name: "Sorte de Principiante", ranks: 1, category: "Fortuna",
    benefit: "Gasta ponto heroico para ganhar temporariamente 5 graduações em uma perícia.",
    description: "Gaste um ponto heroico para receber cinco graduações temporárias em uma perícia na qual tenha atualmente quatro ou menos, inclusive uma perícia não treinada ou que normalmente não possa ser usada destreinada. Os benefícios duram até o fim do encontro.",
  },
  {
    name: "Tiro Preciso", ranks: 2, category: "Combate",
    benefit: "Reduz penalidades por atacar à distância em meio a aliados em combate corpo a corpo.",
    description: "Ao atacar à distância um oponente que luta corpo a corpo com seus aliados, reduza em 4 a penalidade do ataque. Com uma segunda graduação, ignora bônus de Defesa de qualquer cobertura menor que total, chance de erro de qualquer camuflagem menor que total e toda penalidade de Alvo Esquivo.",
  },
  {
    name: "Tolerância", ranks: 5, category: "Geral",
    benefit: "+4 por graduação para resistir a fome, sede, temperaturas e prender a respiração.",
    description: "Receba +4 por graduação em testes de Constituição ou salvamentos de Fortitude para prender a respiração e evitar dano por fome, sede, frio ou calor; também recebe o bônus em testes de Natação para evitar ficar fatigado.",
  },
  {
    name: "Tomar a Iniciativa", ranks: 1, category: "Fortuna",
    benefit: "Gasta ponto heroico para agir primeiro sem rolar Iniciativa.",
    description: "Gaste um ponto heroico quando normalmente faria um teste de Iniciativa para agir primeiro. Se mais de um personagem usar o feito, eles testam Iniciativa entre si; depois agem os demais combatentes.",
  },
  {
    name: "Trabalho em Equipe", ranks: 3, category: "Geral",
    benefit: "Aumenta o bônus concedido ao ajudar aliados.",
    description: "Quando usa a ação auxílio, concede um ponto adicional ao bônus por graduação, até o máximo de +3 para três graduações.",
  },
  {
    name: "Transe", ranks: 1, category: "Geral",
    benefit: "Entra em transe para controlar a respiração e suspender efeitos de veneno ou doença.",
    description: "Após um minuto de meditação e um teste de Concentração CD 15, você entra em transe. Some seu bônus de Concentração à Constituição para determinar quanto tempo prende a respiração e use Concentração contra sufocamento. Veneno e doença ficam suspensos. Você percebe o ambiente e pode sair quando quiser, mas não pode agir durante o transe; outros precisam vencer Notar contra o resultado do seu teste para perceber que está vivo.",
  },
  {
    name: "Zombar", ranks: 1, category: "Perícia",
    benefit: "Usa Blefar no lugar de Intimidar para desmoralizar um oponente.",
    description: "Você pode usar Blefar em vez de Intimidar para desmoralizar. O alvo resiste com Blefar, Intuir Intenção ou Vontade, usando o melhor bônus; cada tentativa de Zombar contra ele no mesmo encontro concede +1 para resistir.",
  },
];
