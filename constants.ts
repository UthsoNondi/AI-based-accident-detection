
export const PROMPT_TEXT = `Excellent — here’s a **perfect, detailed prompt** you can copy–paste into **Claude** (or any other coding assistant) to generate full Python code for your project.

This prompt is structured to ensure Claude writes **organized, modular, and technically strong code** for your hybrid **AI–IoT–Cloud–Quantum Accident Detection System**.

---

### 🧠 **Claude Prompt for Full Python Code Generation**

*(copy-paste everything below)*

---

**Prompt for Claude:**

You are an expert AI–IoT–Cloud–Quantum systems engineer.
Generate a complete **Python-based project** implementing the following concept:

---

### 🚗 **Project Title:**

**Hybrid AI–IoT–Cloud–Quantum Framework for Multi-Modal Accident Detection, Noise Classification, and Intelligent Rescue Coordination**

---

### 🎯 **Project Overview:**

Build an integrated Python project that:

1. Collects IoT sensor data (accelerometer, gyroscope, vibration, GPS, microphone, gas sensor) from Arduino via serial.
2. Uses AI to:

   * Detect accidents or abnormal events.
   * Classify sounds (engine, horn, crash, etc.) using CNN.
   * Predict accident risk from sensor data using ML models (Random Forest / LSTM).
3. Sends real-time data and alerts to a **cloud dashboard** (Flask / Streamlit).
4. Logs verified accidents securely using **blockchain (web3.py)** for tamper-proof storage.
5. Uses **quantum-inspired optimization (Qiskit)** to find the fastest rescue route to the nearest hospital/fire service.
6. Displays live **graphs** (speed vs. accident risk, location map, sound spectrum).
7. Simulates real-time streaming of IoT sensor values for testing.

---

### 🧩 **Modules Required:**

Create a folder structure with these Python modules:

\`\`\`
/hybrid_accident_detection/
│
├── main.py                     # Master control file
├── sensor_reader.py            # Reads simulated Arduino sensor data
├── ai_model.py                 # ML/DL models for prediction
├── sound_classifier.py         # CNN-based noise classification
├── blockchain_logger.py        # Blockchain accident log (web3.py or hashlib)
├── quantum_optimizer.py        # Qiskit-based rescue route optimization
├── cloud_dashboard.py          # Streamlit or Flask dashboard for visualization
├── data/
│   ├── sample_sensor_data.csv
│   ├── sound_samples/
│   └── models/
└── utils/
    ├── visualization.py        # Graphs and analytics
    └── config.py               # API keys, model paths, etc.
\`\`\`

---

### ⚙️ **Functional Requirements:**

#### IoT & Sensor Simulation

* Use \`pyserial\` or simulated random data streams.
* Simulate fields: acceleration, vibration, GPS (lat, long), temperature, gas, sound amplitude.
* Add timestamped logging in CSV.

#### AI Accident Detection

* Train or simulate a **RandomForest or LSTM** model to predict accident risk (\`Low\`, \`Medium\`, \`High\`).
* Use \`scikit-learn\` or \`TensorFlow\`.
* Save and load models using \`joblib\` or \`keras.models\`.

#### Sound Classification

* Use \`librosa\` + \`TensorFlow\` CNN model to classify audio clips (e.g., crash, horn, engine idle).
* Output class probability and sound alert type.

#### Cloud Dashboard

* Use **Streamlit** or **Flask** to visualize:

  * Real-time accident risk graph.
  * Map of latest GPS coordinates.
  * Sound classification and alerts.
  * Blockchain verification of last 10 logs.

#### Blockchain Integration

* Use \`hashlib\` (simple) or \`web3.py\` (Ethereum testnet) to create:

  * Hash-based ledger for each accident event.
  * Function to verify record integrity.

#### Quantum Optimization (Qiskit)

* Create a basic simulation of shortest rescue route using **quantum annealing** or **VQE** algorithm.
* Input: coordinates of hospitals/fire stations.
* Output: fastest rescue path.

#### Visualization

* Use \`matplotlib\` or \`plotly\` for:

  * Accident Risk vs Speed graph.
  * Live time-series of vibration intensity.
  * Blockchain log chain visualization.

---

### 🧠 **Technology Stack:**

* Python 3.10+
* Libraries: \`numpy\`, \`pandas\`, \`scikit-learn\`, \`tensorflow\`, \`keras\`, \`librosa\`, \`matplotlib\`, \`streamlit\`, \`web3\`, \`hashlib\`, \`qiskit\`, \`pyserial\`, \`plotly\`.

---

### 📈 **Deliverables Expected:**

1. Complete modular Python code (runnable from \`main.py\`).
2. Demo simulation mode with random sensor data.
3. Dashboard for visualization.
4. Comments and explanations in each module.
5. Example output logs and graphs (PNG/HTML).

---

### ⚡ **Bonus Request:**

At the end, generate:

* A small \`README.md\` file explaining how to run the project.
* Example simulation outputs (sample graphs, blockchain hash, rescue path).
* Suggestions for Arduino code to send data via serial for future integration.

---

**End of Prompt.**
`;
