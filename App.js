// ─────────────────────────────────────────────────────────────
// CALCULADORA DE IMC — React Native + Expo + Dexie.js
// Professor: Julio Cartier | Disciplina: Programação Android
// ─────────────────────────────────────────────────────────────
//
// INSTALAÇÃO:
//   npx create-expo-app IMCApp
//   cd IMCApp
//   npm install dexie dexie-react-hooks
//   npm install @react-navigation/native @react-navigation/bottom-tabs
//   npx expo install react-native-screens react-native-safe-area-context
//
// USO:
//   Substitua o conteúdo de App.js por este arquivo inteiro.
//   npx expo start
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView,
  FlatList, Alert, Modal, Animated,
} from "react-native";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// ─────────────────────────────────────────
// BANCO DE DADOS — DEXIE.JS
// ─────────────────────────────────────────
const db = new Dexie("IMCDatabase");
db.version(1).stores({
  registros: "++id, peso, altura, imc, categoria, data",
});

// ─────────────────────────────────────────
// PALETA DE CORES
// ─────────────────────────────────────────
const colors = {
  bg: "#F7F9FC",
  card: "#FFFFFF",
  primary: "#4361EE",
  primaryLight: "#EEF1FD",
  accent: "#3DDC97",
  text: "#1A1D2E",
  textMuted: "#8A8FA8",
  border: "#E8ECF4",
  underweight: "#60AFFF",
  normal: "#3DDC97",
  overweight: "#FFB347",
  obese: "#FF6B6B",
};

// ─────────────────────────────────────────
// LÓGICA DE IMC
// ─────────────────────────────────────────
function calcularIMC(peso, altura) {
  const alturaM = altura / 100;
  return peso / (alturaM * alturaM);
}

function getCategoria(imc) {
  if (imc < 18.5) return { label: "Abaixo do peso", color: colors.underweight, emoji: "🌱" };
  if (imc < 25)   return { label: "Peso normal",    color: colors.normal,      emoji: "✅" };
  if (imc < 30)   return { label: "Sobrepeso",       color: colors.overweight,  emoji: "⚠️" };
  return           { label: "Obesidade",             color: colors.obese,       emoji: "🔴" };
}

function getDicas(imc) {
  if (imc < 18.5) return [
    "🥑 Seu corpo tá pedindo mais combustível. Capricha nas refeições — abacate, nozes e proteína são seus melhores amigos agora.",
    "🏋️ Musculação é o move certo aqui. Não precisa virar monstro, mas ganhar massa vai te deixar mais disposto no dia a dia.",
    "🍽️ Tenta fazer umas 5 ou 6 refeições por dia, sem pular. Seu metabolismo agradece.",
    "💊 Vale muito marcar com um nutricionista — eles montam um plano que faz sentido pro seu corpo de verdade.",
    "😴 Não dorme menos de 7 horas não. O sono é quando seu corpo cresce e recupera, sem ele o resto não funciona direito.",
  ];
  if (imc < 25) return [
    "✨ Tá on! Seu peso tá no lugar certo. Continua nessa vibe e não deixa a rotina escapar.",
    "🏃 Mantém o movimento — umas 3x por semana já resolve. Não precisa ser academia, qualquer rolê ativo conta.",
    "🥦 Não precisa fazer dieta maluca. Só equilibra o prato: uma proteína, um carboidrato e bastante vegetal.",
    "💧 Água é subestimada demais. Tenta chegar em 2 litros por dia — faz diferença na energia e na pele.",
    "🧠 Saúde mental é saúde também. Cuida de como você tá se sentindo, não só do físico.",
  ];
  if (imc < 30) return [
    "🚶 Sem drama, mas é hora de dar uma atenção pro seu corpo. Começa simples: 30 minutinhos de caminhada por dia já é muito.",
    "🍽️ Dá uma olhada no que você tá comendo. Reduz os ultraprocessados aos poucos — não precisa ser radical.",
    "📊 Acompanha seu IMC de vez em quando. Ver a evolução é o que mais motiva a continuar.",
    "🥗 Bota mais fibra no prato — fruta, verdura, grão integral. Sacia mais e faz seu corpo funcionar melhor.",
    "👨‍⚕️ Se quiser acelerar o processo, vale consultar um médico ou nutricionista. Pequenas mudanças com orientação certa chegam longe.",
  ];
  return [
    "❤️ Sem julgamento, sério. Mas seu corpo tá mandando um sinal e vale escutar. Buscar ajuda profissional é o move certo agora.",
    "🚴 Começa devagar — natação, bicicleta ou caminhada são ótimas pedidas. O importante é criar o hábito, não a intensidade.",
    "🍱 Não precisa passar fome. Só presta atenção nas porções. Prato menor, mastigar devagar — o corpo sente a diferença.",
    "📉 Vai tirando aos poucos o que não presta: açúcar em excesso, fritura todo dia, refrigerante. Um passo de cada vez.",
    "🏥 Marca uma consulta com médico e nutricionista. Com acompanhamento certo, o resultado vem e vem com saúde.",
  ];
}

// ─────────────────────────────────────────
// TELA 1 — CALCULADORA (CREATE)
// ─────────────────────────────────────────
function CalculadoraScreen({ navigation }) {
  const [peso, setPeso]       = useState("");
  const [altura, setAltura]   = useState("");
  const [resultado, setResultado] = useState(null);
  const [fadeAnim]            = useState(new Animated.Value(0));

  async function calcular() {
    const p = parseFloat(peso.replace(",", "."));
    const a = parseFloat(altura.replace(",", "."));

    if (!p || !a || p <= 0 || a <= 0 || a > 250 || p > 300) {
      Alert.alert("Dados inválidos", "Insira valores realistas de peso e altura.");
      return;
    }

    const imc = calcularIMC(p, a);
    const categoria = getCategoria(imc);

    // CREATE — salva no Dexie
    await db.registros.add({
      peso: p,
      altura: a,
      imc: parseFloat(imc.toFixed(1)),
      categoria: categoria.label,
      data: new Date().toISOString(),
    });

    setResultado({ imc, categoria });
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }

  function resetar() {
    setPeso("");
    setAltura("");
    setResultado(null);
    fadeAnim.setValue(0);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Calcule seu IMC</Text>
        <Text style={s.subtitle}>Índice de Massa Corporal</Text>

        <View style={s.card}>
          <Text style={s.label}>Peso (kg)</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: 70"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />
          <Text style={s.label}>Altura (cm)</Text>
          <TextInput
            style={s.input}
            placeholder="Ex: 170"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
          />
          <TouchableOpacity style={s.btnPrimary} onPress={calcular}>
            <Text style={s.btnPrimaryText}>Calcular</Text>
          </TouchableOpacity>
        </View>

        {resultado && (
          <Animated.View style={[s.resultCard, { opacity: fadeAnim, borderLeftColor: resultado.categoria.color }]}>
            <Text style={s.resultEmoji}>{resultado.categoria.emoji}</Text>
            <Text style={[s.resultIMC, { color: resultado.categoria.color }]}>
              {resultado.imc.toFixed(1)}
            </Text>
            <Text style={s.resultLabel}>{resultado.categoria.label}</Text>
            <View style={s.row}>
              <TouchableOpacity
                style={[s.btnSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => navigation.navigate("Dicas", { imc: resultado.imc })}
              >
                <Text style={s.btnSecondaryText}>Ver dicas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnOutline, { flex: 1 }]} onPress={resetar}>
                <Text style={s.btnOutlineText}>Novo cálculo</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Tabela de referência */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Tabela de referência</Text>
          {[
            { range: "< 18,5",     label: "Abaixo do peso", color: colors.underweight },
            { range: "18,5 – 24,9", label: "Peso normal",   color: colors.normal },
            { range: "25 – 29,9",   label: "Sobrepeso",      color: colors.overweight },
            { range: "≥ 30",        label: "Obesidade",      color: colors.obese },
          ].map((item) => (
            <View key={item.range} style={s.tableRow}>
              <View style={[s.dot, { backgroundColor: item.color }]} />
              <Text style={s.tableRange}>{item.range}</Text>
              <Text style={s.tableLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA 2 — DICAS
// ─────────────────────────────────────────
function DicasScreen({ route }) {
  const imc = route?.params?.imc ?? 22;
  const categoria = getCategoria(imc);
  const dicas = getDicas(imc);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Suas dicas</Text>
        <Text style={s.subtitle}>Baseadas no seu resultado</Text>

        <View style={[s.badgeCard, { backgroundColor: categoria.color + "20", borderColor: categoria.color }]}>
          <Text style={s.badgeEmoji}>{categoria.emoji}</Text>
          <View>
            <Text style={[s.badgeLabel, { color: categoria.color }]}>{categoria.label}</Text>
            <Text style={s.badgeIMC}>IMC {imc.toFixed(1)}</Text>
          </View>
        </View>

        {dicas.map((dica, i) => (
          <View key={i} style={s.dicaCard}>
            <Text style={s.dicaNum}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={s.dicaText}>{dica}</Text>
          </View>
        ))}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            ⚕️ O IMC é só um ponto de partida. Pra uma avaliação de verdade, nada substitui um profissional de saúde.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA 3 — HISTÓRICO (READ, UPDATE, DELETE)
// ─────────────────────────────────────────
function HistoricoScreen() {
  // READ — useLiveQuery atualiza automaticamente quando o banco muda
  const registros = useLiveQuery(() =>
    db.registros.orderBy("id").reverse().toArray()
  );

  const [editando, setEditando]   = useState(null); // registro em edição
  const [novoPeso, setNovoPeso]   = useState("");
  const [novaAltura, setNovaAltura] = useState("");

  // UPDATE — abre modal com dados do registro
  function abrirEdicao(registro) {
    setEditando(registro);
    setNovoPeso(String(registro.peso));
    setNovaAltura(String(registro.altura));
  }

  async function salvarEdicao() {
    const p = parseFloat(novoPeso.replace(",", "."));
    const a = parseFloat(novaAltura.replace(",", "."));

    if (!p || !a || p <= 0 || a <= 0 || a > 250 || p > 300) {
      Alert.alert("Dados inválidos", "Insira valores realistas.");
      return;
    }

    const imc = calcularIMC(p, a);
    const categoria = getCategoria(imc);

    // UPDATE no Dexie
    await db.registros.update(editando.id, {
      peso: p,
      altura: a,
      imc: parseFloat(imc.toFixed(1)),
      categoria: categoria.label,
    });

    setEditando(null);
  }

  // DELETE
  async function deletar(id) {
    Alert.alert("Excluir registro", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => db.registros.delete(id),
      },
    ]);
  }

  async function limparTudo() {
    Alert.alert("Limpar histórico", "Apagar todos os registros?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar tudo", style: "destructive", onPress: () => db.registros.clear() },
    ]);
  }

  const lista = registros ?? [];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Histórico</Text>
          <Text style={s.subtitle}>{lista.length} registro{lista.length !== 1 ? "s" : ""}</Text>
        </View>
        {lista.length > 0 && (
          <TouchableOpacity onPress={limparTudo} style={s.btnClear}>
            <Text style={s.btnClearText}>Limpar tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty state */}
      {lista.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>📋</Text>
          <Text style={s.emptyTitle}>Nenhum registro ainda</Text>
          <Text style={s.emptyText}>Calcule seu IMC na aba Calcular para ver seu histórico aqui.</Text>
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const cat = getCategoria(item.imc);
            const dataFormatada = new Date(item.data).toLocaleDateString("pt-BR");
            const horaFormatada = new Date(item.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            return (
              <View style={s.historicoCard}>
                <View style={[s.imcBadge, { backgroundColor: cat.color + "20" }]}>
                  <Text style={[s.imcBadgeText, { color: cat.color }]}>{item.imc}</Text>
                </View>
                <View style={s.historicoInfo}>
                  <Text style={s.historicoCategoria}>{item.categoria}</Text>
                  <Text style={s.historicoDetalhe}>{item.peso}kg · {item.altura}cm</Text>
                  <Text style={s.historicoData}>{dataFormatada} às {horaFormatada}</Text>
                </View>
                <View style={s.historicoAcoes}>
                  <TouchableOpacity onPress={() => abrirEdicao(item)} style={s.btnEdit}>
                    <Text style={s.btnEditText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deletar(item.id)} style={s.btnDelete}>
                    <Text style={s.btnDeleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal de edição (UPDATE) */}
      <Modal visible={!!editando} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Editar registro</Text>

            <Text style={s.label}>Peso (kg)</Text>
            <TextInput
              style={s.input}
              keyboardType="numeric"
              value={novoPeso}
              onChangeText={setNovoPeso}
            />

            <Text style={s.label}>Altura (cm)</Text>
            <TextInput
              style={s.input}
              keyboardType="numeric"
              value={novaAltura}
              onChangeText={setNovaAltura}
            />

            <View style={s.row}>
              <TouchableOpacity
                style={[s.btnOutline, { flex: 1, marginRight: 8 }]}
                onPress={() => setEditando(null)}
              >
                <Text style={s.btnOutlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={salvarEdicao}>
                <Text style={s.btnPrimaryText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 64,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          tabBarIcon: ({ focused }) => {
            const icons = { Calcular: "⚖️", Dicas: "💡", Histórico: "📋" };
            return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
          },
        })}
      >
        <Tab.Screen name="Calcular"  component={CalculadoraScreen} />
        <Tab.Screen name="Dicas"     component={DicasScreen} />
        <Tab.Screen name="Histórico" component={HistoricoScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────
const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.bg },
  scroll:   { padding: 20, paddingBottom: 40 },
  header:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },

  title:    { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 },

  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, marginBottom: 16,
  },

  btnPrimary:     { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  btnSecondary:     { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnSecondaryText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  btnOutline:     { borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  btnOutlineText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },

  btnClear:     { paddingHorizontal: 12, paddingVertical: 6 },
  btnClearText: { color: colors.obese, fontWeight: "600", fontSize: 14 },

  row: { flexDirection: "row", width: "100%" },

  resultCard: {
    backgroundColor: colors.card, borderRadius: 16, padding: 24, marginBottom: 16,
    alignItems: "center", borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  resultEmoji: { fontSize: 40, marginBottom: 8 },
  resultIMC:   { fontSize: 56, fontWeight: "800", letterSpacing: -2 },
  resultLabel: { fontSize: 18, color: colors.textMuted, fontWeight: "600", marginBottom: 20 },

  tableRow:   { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  dot:        { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  tableRange: { fontSize: 13, color: colors.textMuted, width: 90 },
  tableLabel: { fontSize: 14, color: colors.text, fontWeight: "500" },

  badgeCard:  { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, padding: 16, marginBottom: 20, gap: 12 },
  badgeEmoji: { fontSize: 32 },
  badgeLabel: { fontSize: 18, fontWeight: "700" },
  badgeIMC:   { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  dicaCard: {
    backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: "row", alignItems: "flex-start",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  dicaNum:  { fontSize: 11, fontWeight: "800", color: colors.primary, width: 28, marginTop: 2 },
  dicaText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },

  disclaimer:     { backgroundColor: colors.primaryLight, borderRadius: 12, padding: 14, marginTop: 8 },
  disclaimerText: { fontSize: 13, color: colors.primary, lineHeight: 18 },

  historicoCard: {
    backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  imcBadge:     { width: 60, height: 60, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  imcBadgeText: { fontSize: 20, fontWeight: "800" },
  historicoInfo: { flex: 1 },
  historicoCategoria: { fontSize: 15, fontWeight: "700", color: colors.text },
  historicoDetalhe:   { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  historicoData:      { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  historicoAcoes: { flexDirection: "row", gap: 8 },
  btnEdit:        { padding: 8 },
  btnEditText:    { fontSize: 18 },
  btnDelete:      { padding: 8 },
  btnDeleteText:  { fontSize: 18 },

  empty:      { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 },
  emptyText:  { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: "#00000066", justifyContent: "flex-end" },
  modalCard:    { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle:   { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 20 },
});
