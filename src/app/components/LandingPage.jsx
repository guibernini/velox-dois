"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Home, Building, Factory, Building2, Tractor, CheckCircle, HardHat, Headset, Zap, Car, Battery, TrendingUp } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";

// --- COMPONENTE DE NÚMEROS ANIMADOS ---
function AnimatedNumber({ value, suffix, duration, start }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startVal = 0;
    const stepTime = 20;
    const totalSteps = Math.ceil(duration / stepTime);
    const increment = value / totalSteps;
    const interval = setInterval(() => {
      startVal += increment;
      if (startVal >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(startVal));
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [start, value, duration]);

  return <span>{count.toLocaleString('pt-BR')}{suffix}</span>;
}

export default function LandingPage() {
  const router = useRouter();

  // --- CONFIGURAÇÕES GERAIS ---
  const whatsappNumber = "5511940306171"; 
  const whatsappBase = `https://wa.me/${whatsappNumber}`;
  const instagramLink = "https://www.instagram.com/veloxsolar.pompeiahome/"; // Link recuperado
  const emailLink = "mailto:saopaulo.pompeia@veloxsolarenergia.com.br"; // Link recuperado
  const webhookUrl = "https://hook.us2.make.com/6xwyjwejrjvweam1akefa9u35sv72j5g";
  
  // --- FUNÇÃO PIXEL ---
  const trackPixel = (eventName, params = {}) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq('track', eventName, params);
    }
    console.log(`📡 Pixel Disparado: ${eventName}`, params);
  };

  // --- REDIRECIONAMENTO (BRIDGE PAGE) ---
  const redirectToThankYou = (finalUrl, originName) => {
    trackPixel('Contact', { content_name: originName });
    localStorage.setItem("velox_redirect", finalUrl);
    router.push("/obrigado");
  };

  const handleSimpleClick = (origin) => {
      redirectToThankYou(whatsappBase, origin);
  };

  // Estados
  const [step, setStep] = useState(1);
  const [loadingSim, setLoadingSim] = useState(false);
  const [sendingLead, setSendingLead] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const toggleIndex = (index) => setOpenIndex(openIndex === index ? null : index);
  
  // Formulário
  const [formData, setFormData] = useState({
    valorConta: "",
    tipoImovel: "residencial",
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: ""
  });

  // Resultados
  const [simulation, setSimulation] = useState({
    economiaAnual: 0,
    qtdPlacas: 0,
    producaoMensal: 0,
    areaNecessaria: 0
  });

  // --- LÓGICA DA CALCULADORA ---
  const handleCalculate = () => {
    const valor = parseFloat(formData.valorConta.replace("R$", "").replace(".", "").replace(",", ".")) || 0;
    
    if (valor < 100) {
      alert("Por favor, insira um valor de conta válido (mínimo R$ 100).");
      return;
    }

    setLoadingSim(true);
    trackPixel('InitiateCheckout', { value: valor, currency: 'BRL' });
    
    setTimeout(() => {
      const novaConta = Math.max(valor * 0.05, 50); 
      const economiaMensal = valor - novaConta;
      const economiaAnual = economiaMensal * 12;
      const kwhNecessario = valor / 0.95; 
      const placas = Math.ceil(kwhNecessario / 60); 
      const area = Math.ceil(placas * 2.5); 
      const producao = Math.floor(placas * 60);

      setSimulation({ economiaAnual, qtdPlacas: placas, producaoMensal: producao, areaNecessaria: area });
      setStep(2);
      setLoadingSim(false);
    }, 1000);
  };

  // --- ENVIO PARA O MAKE (WEBHOOK) ---
  const handleLeadSubmit = async () => {
    if(!formData.nome || !formData.telefone) return alert("Por favor, preencha Nome e Whatsapp.");
    
    setSendingLead(true);

    const leadData = {
        data_criacao: new Date().toLocaleString("pt-BR"),
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        cidade: formData.cidade,
        estado: formData.estado,
        valor_conta: formData.valorConta,
        tipo_imovel: formData.tipoImovel,
        economia_anual_estimada: simulation.economiaAnual,
        qtd_placas_estimada: simulation.qtdPlacas
    };

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leadData)
        });
        console.log("Lead enviado para o Make com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar lead:", error);
    }

    trackPixel('AddPaymentInfo'); 
    setStep(3);
    setSendingLead(false);
  };

  const handleFinalWhatsApp = () => {
    const fMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const text = `*Olá! Fiz a simulação no site da Velox.* ☀️\n\n👤 *MEUS DADOS:*\nNome: ${formData.nome}\nCidade: ${formData.cidade}/${formData.estado}\n\n💡 *MINHA CONTA:*\nValor Atual: R$ ${formData.valorConta}\nTipo: ${formData.tipoImovel}\n\n📊 *RESULTADO PRELIMINAR:*\nEconomia Anual: ${fMoney(simulation.economiaAnual)}\nPlacas Estimadas: ${simulation.qtdPlacas}\nÁrea Necessária: ${simulation.areaNecessaria} m²\n\n*Gostaria de receber a proposta oficial!*`;
    const finalUrl = `${whatsappBase}?text=${encodeURIComponent(text)}`;
    redirectToThankYou(finalUrl, 'Calculadora Final');
  };

  const handleCurrencyInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (value / 100).toFixed(2) + "";
    value = value.replace(".", ",");
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setFormData({ ...formData, valorConta: value });
  };

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const stats = [
    { label: "Redução na Conta de Luz", value: 95, suffix: "%", duration: 2000, icon: "💡" },
    { label: "Anos de Garantia", value: 25, suffix: "+", duration: 2500, icon: "🛠️" },
    { label: "Energia Disponível", value: 24, suffix: "/7", duration: 1500, icon: "⚡" },
  ];

  const solutions = [
    { icon: Home, title: "Residencial", desc: "Proteja sua família da inflação energética." },
    { icon: Car, title: "Mobilidade Elétrica", desc: "Carregadores Wallbox para seu veículo elétrico." },
    { icon: Factory, title: "Empresarial", desc: "Reduza o custo fixo e aumente sua margem de lucro." },
    { icon: Tractor, title: "Agro Solar", desc: "Energia para irrigação e produção no campo." },
    { icon: Battery, title: "Off-Grid & Híbrido", desc: "Baterias para backup. Nunca mais fique sem luz." },
    { icon: TrendingUp, title: "Investimento", desc: "Retorno financeiro superior a Renda Fixa e Poupança." }
  ];

  const faqs = [
    { question: "1. Quais os benefícios da Cooperativa de Energia?", answer: "A Cooperativa oferece redução significativa na conta de energia, acesso a energia limpa e renovável, e participação nos créditos gerados pela usina." },
    { question: "2. Preciso fazer algum investimento?", answer: "O cooperado precisa apenas assinar o contrato e, dependendo do modelo, contribuir com uma taxa simbólica para manutenção da usina." },
    { question: "3. O que é necessário para participar da Cooperativa?", answer: "É necessário ser pessoa física ou jurídica, residir ou atuar na área de atendimento da usina, e preencher o cadastro da cooperativa." },
    { question: "4. Como faço se minha empresa quiser sair da Cooperativa? É cobrado multa?", answer: "O cooperado pode solicitar a saída a qualquer momento. Não há multa, mas créditos acumulados não utilizados podem ser perdidos." },
    { question: "5. Se houver algum problema ou indisponibilidade momentânea na usina, ficarei sem energia?", answer: "Não. A cooperativa mantém contrato com a rede local para garantir fornecimento contínuo, mesmo em caso de falhas temporárias na usina." },
    { question: "6. Se a Cooperativa não gerar os créditos de energia em algum mês, o que acontece?", answer: "Os créditos não gerados não são cobrados do cooperado e são compensados nos meses seguintes, de acordo com a produção da usina." },
    { question: "7. Como é feita a divisão e distribuição da energia entre os cooperados?", answer: "A energia gerada é proporcional à cota de cada cooperado, garantindo que todos recebam sua parte conforme contrato." },
    { question: "8. Haverá uma rede elétrica exclusiva da usina até o meu estabelecimento?", answer: "Não. A distribuição é feita através da rede existente, sem necessidade de construção de linha exclusiva." },
    { question: "9. Precisarei fazer alguma alteração física, obra ou reforma no meu estabelecimento para começar a receber a energia da usina?", answer: "Na maioria dos casos não é necessária nenhuma alteração, apenas ajustes mínimos na medição e conexão à rede." },
    { question: "10. Meu desconto é o mesmo todos os meses?", answer: "O desconto é calculado mensalmente de acordo com a produção da usina e consumo do cooperado, podendo variar ligeiramente." },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white font-sans selection:bg-[#00FF88] selection:text-black">

      {/* BOTÃO FLUTUANTE (FIXO) */}
      <button 
        onClick={() => handleSimpleClick('Botão Flutuante Fixo')}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebc57] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 flex items-center gap-3 group border-2 border-transparent hover:border-white"
      >
        <FaWhatsapp className="text-3xl" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-bold text-lg">
          Chamar no WhatsApp
        </span>
      </button>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[100vh] lg:min-h-[90vh] flex items-center pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <Image src="/hero-solar.webp" alt="Energia Solar" fill className="object-cover opacity-60" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17] via-[#0B0D17]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0D17]" />
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Texto Hero */}
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-block px-4 py-1 rounded-full border border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88] text-sm font-semibold mb-6">🚀 Energia Solar Premium</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Zere sua conta de luz com a <span className="text-[#00FF88]">Velox Solar</span></h1>
                <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">Invista no seu imóvel, não na conta de luz. Economia garantida de até 95% com tecnologia de ponta e instalação certificada.</p>
                
                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-400 mb-8">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10"><CheckCircle className="text-yellow-500 w-5 h-5"/> Projeto Homologado</div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10"><CheckCircle className="text-yellow-500 w-5 h-5"/> Instalação em 15 dias</div>
                </div>

                <button onClick={() => handleSimpleClick('Botão Principal Hero')} className="inline-flex items-center gap-3 bg-[#00FF88] text-black font-extrabold py-4 px-8 rounded-full hover:bg-[#00e67a] transition-all shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:scale-105 hover:-translate-y-1 text-lg">
                    <FaWhatsapp size={24}/> Quero meu Orçamento no WhatsApp
                </button>
            </motion.div>

            {/* Calculadora */}
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-[#141826]/80 backdrop-blur-xl rounded-3xl p-1 border border-white/10 shadow-2xl">
                <div className="bg-[#0B0D17]/50 rounded-[20px] p-6 md:p-8 border border-white/5">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <h3 className="text-2xl font-bold mb-2">Simule sua Economia</h3>
                                <p className="text-gray-400 mb-6 text-sm">Preencha para calcular o potencial do seu telhado.</p>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[#00FF88] text-xs font-bold uppercase tracking-wider mb-2 block">Valor Mensal da Conta</label>
                                        <input type="text" value={formData.valorConta} onChange={handleCurrencyInput} placeholder="R$ 0,00" className="w-full bg-[#0B0D17] border border-gray-700 focus:border-[#00FF88] rounded-xl py-4 px-4 text-2xl font-bold text-white outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de Imóvel</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[ {id:'residencial', icon:Home}, {id:'comercial', icon:Building}, {id:'rural', icon:Tractor}, {id:'industrial', icon:Factory} ].map((tipo) => (
                                                <button key={tipo.id} onClick={() => setFormData({...formData, tipoImovel: tipo.id})} className={`p-3 rounded-xl border flex justify-center items-center transition-all ${formData.tipoImovel === tipo.id ? "bg-[#00FF88] border-[#00FF88] text-black" : "border-gray-700 text-gray-400 hover:bg-white/5"}`}><tipo.icon size={20} /></button>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={handleCalculate} disabled={loadingSim} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-4 rounded-xl text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">{loadingSim ? "Calculando..." : "Calcular Economia ⚡"}</button>
                                </div>
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div key="step2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-4">
                                <div className="text-center mb-6">
                                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#00FF88]/20 text-[#00FF88] mb-4"><Zap size={32} /></div>
                                    <h3 className="text-xl font-bold text-white">Cálculo Concluído!</h3>
                                    <p className="text-gray-400 text-sm">Insira seus dados para desbloquear o relatório.</p>
                                </div>
                                <input type="text" placeholder="Seu Nome" value={formData.nome} onChange={e=>setFormData({...formData, nome:e.target.value})} className="w-full p-4 rounded-xl bg-[#0B0D17] border border-gray-700 focus:border-[#00FF88] outline-none text-white" />
                                <input type="tel" placeholder="WhatsApp (com DDD)" value={formData.telefone} onChange={e=>setFormData({...formData, telefone:e.target.value})} className="w-full p-4 rounded-xl bg-[#0B0D17] border border-gray-700 focus:border-[#00FF88] outline-none text-white" />
                                <input type="email" placeholder="Email (opcional)" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full p-4 rounded-xl bg-[#0B0D17] border border-gray-700 focus:border-[#00FF88] outline-none text-white" />
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="text" placeholder="Cidade" value={formData.cidade} onChange={e=>setFormData({...formData, cidade:e.target.value})} className="col-span-2 p-4 rounded-xl bg-[#0B0D17] border border-gray-700 focus:border-[#00FF88] outline-none text-white" />
                                    <input type="text" placeholder="UF" value={formData.estado} onChange={e=>setFormData({...formData, estado:e.target.value.toUpperCase()})} maxLength={2} className="p-4 rounded-xl bg-[#0B0D17] border border-gray-700 focus:border-[#00FF88] outline-none text-white text-center" />
                                </div>
                                
                                <button onClick={handleLeadSubmit} disabled={sendingLead} className="w-full bg-[#00FF88] text-black font-bold py-4 rounded-xl hover:bg-[#00e67a] transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {sendingLead ? "Enviando dados..." : "Ver Resultado Agora 🔓"}
                                </button>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div key="step3" initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="text-center">
                                <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Economia Anual Estimada</p>
                                <div className="text-4xl md:text-5xl font-black text-[#00FF88] mb-6 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">R$ {simulation.economiaAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><div className="text-2xl mb-1">🔆</div><div className="font-bold text-white text-lg">{simulation.qtdPlacas} Painéis</div></div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10"><div className="text-2xl mb-1">📐</div><div className="font-bold text-white text-lg">{simulation.areaNecessaria} m²</div></div>
                                </div>
                                <button onClick={handleFinalWhatsApp} className="w-full bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"><FaWhatsapp size={24} /> Receber Proposta Oficial</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
      </section>

      {/* ================= NÚMEROS ================= */}
      <section ref={statsRef} className="py-20 bg-[#0E111C] border-y border-white/5">
        <div className="container mx-auto grid md:grid-cols-3 gap-12 px-6 text-center">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} transition={{delay:i*0.2}}>
                <div className="text-4xl mb-4">{stat.icon}</div>
                <h3 className="text-5xl font-bold text-white mb-2"><AnimatedNumber value={stat.value} suffix={stat.suffix} duration={stat.duration} start={statsInView} /></h3>
                <p className="text-[#00FF88] uppercase tracking-wider font-semibold text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= POR QUE A VELOX ================= */}
      <section className="py-24 bg-[#0B0D17]">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-16 items-center">
            <motion.div className="lg:w-1/2" initial={{opacity:0, x:-50}} whileInView={{opacity:1, x:0}}>
                <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src="/solar-texto.jpeg" alt="Instalação Profissional" fill className="object-cover hover:scale-105 transition duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8"><p className="text-white font-medium">Instalações em todo o Brasil com equipe própria.</p></div>
                </div>
            </motion.div>
            <motion.div className="lg:w-1/2 space-y-8" initial={{opacity:0, x:50}} whileInView={{opacity:1, x:0}}>
                <div><h2 className="text-4xl font-bold mb-4">Por que escolher a Velox?</h2><p className="text-gray-400 text-lg">Não vendemos apenas placas, entregamos uma solução completa de engenharia energética.</p></div>
                <div className="space-y-4">
                    {[ { title: "Tecnologia Tier-1", desc: "Trabalhamos apenas com as melhores marcas globais (WEG, Deye, Canadian).", icon: CheckCircle }, { title: "Monitoramento App 24h", desc: "Acompanhe sua produção e economia em tempo real pelo celular.", icon: Zap }, { title: "Suporte Vitalício", desc: "Equipe de pós-venda dedicada para garantir sua geração.", icon: Headset } ].map((item, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#141826] border border-white/5 hover:border-[#00FF88] transition-colors">
                            <div className="bg-[#00FF88]/10 p-3 rounded-lg h-fit text-[#00FF88]"><item.icon size={24}/></div>
                            <div><h4 className="text-white font-bold text-lg">{item.title}</h4><p className="text-gray-400 text-sm mt-1">{item.desc}</p></div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
      </section>

      {/* ================= SOLUÇÕES ================= */}
      <section className="py-24 bg-[#0E111C]">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16"><h2 className="text-4xl font-bold mb-4">Soluções para todos os perfis</h2><p className="text-gray-400">Do residencial ao grande industrial, temos o projeto ideal para sua necessidade.</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((item, i) => (
                    <motion.div key={i} whileHover={{y:-5}} className="bg-[#141826] p-8 rounded-2xl border border-white/5 hover:border-[#00FF88] transition-all group">
                        <item.icon className="w-12 h-12 text-[#00FF88] mb-6 group-hover:scale-110 transition-transform"/>
                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
            <div className="text-center mt-12"><button onClick={() => handleSimpleClick('Botão Soluções')} className="inline-flex items-center gap-2 border border-[#00FF88] text-[#00FF88] font-bold py-3 px-8 rounded-full hover:bg-[#00FF88] hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)]"><FaWhatsapp size={20} /> Falar com um Consultor</button></div>
        </div>
      </section>

      {/* ================= QUEM SOMOS ================= */}
      <section className="py-20 bg-[#0B0D17]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <h2 className="text-4xl font-bold text-[#00FF88]">Quem é a Velox?</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                    Com mais de 10.000 projetos entregues, somos líderes em transformar telhados em usinas de energia limpa.
                    Nossa missão é democratizar o acesso à energia solar com tecnologia de ponta e engenharia de precisão.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-gray-400"><CheckCircle className="text-yellow-500"/> Engenharia Própria</li>
                    <li className="flex items-center gap-3 text-gray-400"><CheckCircle className="text-yellow-500"/> Pós-venda dedicado</li>
                    <li className="flex items-center gap-3 text-gray-400"><CheckCircle className="text-yellow-500"/> Homologação em todas as concessionárias</li>
                </ul>
                <button onClick={() => handleSimpleClick('Botão Quem Somos')} className="mt-4 px-8 py-3 bg-transparent border border-[#00FF88] text-[#00FF88] rounded-full hover:bg-[#00FF88] hover:text-black transition font-bold">
                    Conhecer nossa história
                </button>
            </div>
            <div className="flex-1 relative h-[400px] w-full">
                <Image src="/cards-solar.webp" alt="Equipe Velox" fill className="object-cover rounded-2xl grayscale hover:grayscale-0 transition duration-700" />
            </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="py-24 bg-[#0E111C]">
        <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-white/10 rounded-xl bg-[#141826] overflow-hidden">
                        <button onClick={() => toggleIndex(i)} className="w-full flex justify-between items-center p-5 text-left font-semibold hover:bg-white/5 transition">{faq.question}<span className="text-[#00FF88] text-2xl">{openIndex === i ? "−" : "+"}</span></button>
                        <AnimatePresence>{openIndex === i && (<motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden"><div className="p-5 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">{faq.answer}</div></motion.div>)}</AnimatePresence>
                    </div>
                ))}
            </div>
            <div className="text-center mt-12"><p className="text-gray-400 mb-4">Ainda tem dúvidas sobre o seu projeto?</p><button onClick={() => handleSimpleClick('Botão Final FAQ')} className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold py-3 px-8 rounded-full hover:bg-[#1ebc57] transition-all shadow-lg hover:shadow-green-900/40"><FaWhatsapp size={20} /> Tirar Dúvidas no WhatsApp</button></div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left"><h4 className="text-2xl font-bold text-white mb-2">VELOX SOLAR</h4><p className="text-gray-500 text-sm">Energia inteligente para um futuro sustentável.</p></div>
            <div className="flex gap-6">
                <button onClick={() => handleSimpleClick('Ícone Footer Zap')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#00FF88] hover:text-black transition"><FaWhatsapp/></button>
                <a href={instagramLink} target="_blank" onClick={() => trackPixel('Contact', { content_name: 'Instagram Footer' })} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-pink-600 transition"><FaInstagram/></a>
                <a href={emailLink} onClick={() => trackPixel('Contact', { content_name: 'Email Footer' })} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition"><FaEnvelope/></a>
            </div>
        </div>
        <div className="text-center text-gray-600 text-xs mt-12">© 2026 Velox Solar. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}