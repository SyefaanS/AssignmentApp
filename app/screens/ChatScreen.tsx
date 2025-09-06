import React, { useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Text } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";

// Message type
interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
}

const OPENAI_API_KEY = "sk-proj-XXXXXX";

const ChatScreen: React.FC = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

const fetchAIResponse = async () => {
  if (!query.trim()) return;

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    sender: "user",
    text: query,
  };

  setMessages((prev) => [userMessage, ...prev]);
  setLoading(true);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query }],
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    let aiText = "";

    // ✅ If OpenAI returned an error
    if (data.error) {
      aiText = `⚠️ AI Error: ${data.error.message}`;
    } else {
      aiText = data?.choices?.[0]?.message?.content ?? "⚠️ No response";
    }

    const aiMessage: ChatMessage = {
      id: Date.now().toString() + "-ai",
      sender: "ai",
      text: aiText,
    };

    setMessages((prev) => [aiMessage, ...prev]);
  } catch (err) {
    console.error("AI fetch error:", err);
    setMessages((prev) => [
      {
        id: Date.now().toString() + "-err",
        sender: "ai",
        text: "⚠️ Failed to get response.",
      },
      ...prev,
    ]);
  } finally {
    setLoading(false);
    setQuery("");
  }
};


  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={renderMessage}
        contentContainerStyle={{ gap: 10 }}
        inverted
      />
      <TextInput
        style={styles.input}
        placeholder="Ask AI..."
        value={query}
        onChangeText={setQuery}
      />
      <ButtonPrimary
        title={loading ? "Loading..." : "Send"}
        onPress={fetchAIResponse}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginVertical: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
  },
  messageText: { fontSize: 16 },
});

export default ChatScreen;
