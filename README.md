# Glauco-Guard AI: Early Glaucoma Detection System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-ee4c2c.svg)](https://pytorch.org/)
[![Django](https://img.shields.io/badge/Django-4.2%2B-092e20.svg)](https://www.djangoproject.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-61dafb.svg)](https://expo.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://www.docker.com/)
[![Institution](https://img.shields.io/badge/UENR-Group%2018D-green.svg)](https://uenr.edu.gh/)

> **A Transfer Learning-Based Vision Transformer (ViT-B/16) System for Early Glaucoma Detection from Retinal Fundus Images**  
> Final Year Capstone Project submitted in partial fulfillment of the requirements for the award of the degree of **Bachelor of Science in Information Technology**.

---

## 🏛️ Academic & Institutional Profile

* **Institution:** [University of Energy and Natural Resources (UENR)](https://uenr.edu.gh/), Sunyani, Ghana  
* **School:** School of Sciences  
* **Department:** Department of Information Technology and Decision Sciences  
* **Programme:** B.Sc. Information Technology  
* **Project Group:** **GROUP 18D**  
* **Academic Year:** 2025/2026  

### 👥 Project Team (Group 18D)

| Name | Student ID / Index No. | Role & Contribution | GitHub Profile |
| :--- | :--- | :--- | :--- |
| **KWAME OFOSU GRANT** | `UEB3262522` | Project Lead / AI & Backend Architecture | [@Grantjnr](https://github.com/Grantjnr) |
| **BOAKYE OBED FORDJOUR** | `UEB3258722` | Data Acquisition & Model Fine-Tuning | — |
| **BEMAH REGINA** | `UEB3263822` | Mobile UI / Frontend Engineering | — |
| **ISHAQ DAUDA** | `UEB3250822` | Testing, API Integration & Evaluation | — |
| **AWONAYA DERRICK** | `UEB3259522` | Clinical Workflow & Documentation | — |

* **Project Supervisor:** **Dr. Kwabena Adu** *(Senior Lecturer, UENR)*  
* **Head of Department:** **Prof. Peter Appiahene** *(Department of IT and Decision Sciences, UENR)*  

---

## 📋 Executive Abstract

Glaucoma is the leading global cause of irreversible blindness, often progressing asymptomatically until advanced vision loss occurs ("the silent thief of sight"). Early detection is vital to prevent permanent optic nerve damage. Conventional screening requires specialized instruments (such as slit-lamp biomicroscopes, tonometers, and optical coherence tomography [OCT]) alongside trained ophthalmologists—resources that remain critically scarce in resource-constrained communities and rural clinics across sub-Saharan Africa.

**Glauco-Guard AI** addresses this gap with an end-to-end, mobile-accessible clinical screening platform powered by a single deep learning inference engine: a **Transfer Learning-Based Vision Transformer (ViT-B/16)**. Trained on clinically annotated retinal fundus images, the system incorporates automated image validation, confidence thresholding, a cross-platform mobile interface (React Native/Expo), a robust RESTful API backend (Django REST Framework), and a Clinical Administrator Dashboard with an automated PDF Report Vault. The platform delivers diagnostic inferences in under 3 seconds, offering an accessible frontline screening aid for community health workers and primary care clinics.

---

## 🚀 Key Features

* 📱 **Mobile-First Screening Interface:** Built with React Native and Expo for iOS and Android, allowing field workers to take live fundus photos or upload scans from the device gallery.
* 🧠 **Vision Transformer (ViT-B/16) Engine:** Fine-tuned via transfer learning to capture global dependencies across retinal fundus images with multi-head self-attention.
* 🛡️ **Heuristic Fundus Validation (`is_fundus_image`):** Automatically analyzes RGB channel distribution and red-to-blue intensity ratios to reject non-fundus submissions (selfies, documents, landscape photos) with 100% alpha-test precision.
* ⚠️ **Confidence Thresholding Safeguard:** Rejects ambiguous predictions with confidence below 60%, classifying them as *"Unsure"* to prompt a clearer rescan rather than risking misdiagnosis.
* 📊 **Clinical Administrator Dashboard:** Web-based portal for reviewing screening statistics, patient histories, and diagnostic audit logs.
* 📄 **Report Vault (Automated PDF Generation):** Generates standardized clinical diagnostic summary reports in PDF format for patient records and referrals.
* 🔄 **Specialist Referral Workflow:** Enables primary clinicians to flag abnormal cases and assign them directly to ophthalmologists for secondary review.
* 🐳 **Containerized Deployment:** Fully reproducible multi-container orchestration with Docker and Docker Compose.

---

## 🏗️ System Architecture

The system follows a modular three-tier architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│                                                                        │
│   ┌───────────────────────────────┐  ┌───────────────────────────────┐ │
│   │   Mobile Application (Expo)   │  │ Clinical Admin Portal (Web)   │ │
│   │  - Camera/Gallery Capture     │  │  - Statistics & Case Review   │ │
│   │  - Real-time Diagnostic Meter │  │  - Report Vault (PDF Export)  │ │
│   └───────────────┬───────────────┘  └───────────────┬───────────────┘ │
└───────────────────┼──────────────────────────────────┼─────────────────┘
                    │ HTTP REST / JSON                 │
┌───────────────────┼──────────────────────────────────┼─────────────────┐
│                   ▼                                  ▼                 │
│                        APPLICATION LAYER (BACKEND)                     │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               Django REST Framework API Gateway                │   │
│   │                                                                │   │
│   │   ┌───────────────────────┐        ┌───────────────────────┐   │   │
│   │   │ Heuristic RGB Fundus  │        │ Confidence Threshold  │   │   │
│   │   │ Validation Filter     │        │ Engine (60% Minimum)  │   │   │
│   │   └───────────┬───────────┘        └───────────▲───────────┘   │   │
│   │               │                                │               │   │
│   │               ▼                                │               │   │
│   │   ┌────────────────────────────────────────────┴───────────┐   │   │
│   │   │            PyTorch TorchScript JIT Runtime             │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   │                                                                │   │
│   │   ┌───────────────────────┐        ┌───────────────────────┐   │   │
│   │   │ Referral Management   │        │ Audit Log Engine      │   │   │
│   │   └───────────────────────┘        └───────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼─────────────────────────────────┐
│                           DATA & MODEL LAYER                           │
│                                                                        │
│   ┌─────────────────────────┐  ┌───────────────────────────────────┐   │
│   │ Relational Database     │  │ Serialized Model Checkpoints      │   │
│   │ (SQLite3 / PostgreSQL)  │  │ - ViT-B/16 (glaucoma_vit_...pt)   │   │
│   │ Patient Scans & Audits  │  │ - ResNet50 (glaucoma_mobile...pt) │   │
│   └─────────────────────────┘  └───────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 AI Model Development & Experimental Results

### Model Architecture: Vision Transformer (`ViT-B/16`)
* **Base Architecture:** Pretrained `ViT-B/16` (12 transformer encoder blocks, 768 hidden dimension, 16×16 patch size).
* **Transfer Learning Strategy:** Early transformer blocks frozen; the final 4 transformer blocks and terminal LayerNorm were unfrozen for domain-specific fine-tuning.
* **Custom Classification Head:**
  $$\text{Input (768)} \xrightarrow{\text{Dropout}(0.5)} \text{Linear}(768 \to 512) \xrightarrow{\text{ReLU}} \text{Dropout}(0.3) \xrightarrow{\text{Linear}}(512 \to 2) \to [\text{Normal}, \text{Glaucoma}]$$

### Training Configuration
* **Dataset:** 4,053 clinically annotated retinal fundus images (Kaggle `sreeharims/glaucoma-dataset`).
  * Training Split: 3,063 images
  * Evaluation Split: 990 images
  * Held-out Test Split: 774 images
* **Preprocessing:** Standardized to $224 \times 224$ pixels.
* **Augmentations:** Random horizontal flip ($p=0.5$), random affine rotation ($\pm 15^\circ$), ImageNet color normalization ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).
* **Loss & Optimization:** Class-weighted Cross-Entropy Loss to counter class imbalance; Adam optimizer ($\text{lr} = 10^{-3}$, batch size 32).
* **Serving Artifact:** Exported as optimized TorchScript (`glaucoma_vit_mobile_model.pt`).

### Test Set Performance Metrics

| Diagnostic Class | Precision | Recall (Sensitivity) | F1-Score | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Glaucoma** | **85.0%** | **50.0%** | **63.0%** | High precision minimises false alarms |
| **Normal** | **81.0%** | **96.0%** | **88.0%** | High sensitivity ensures healthy retinas pass |
| **Overall Test Accuracy** | — | — | **81.52%** | Validated on unseen held-out data |
| **Inference Latency** | — | — | **< 3.0s** | End-to-end (mobile upload to display) |

---

## 💻 Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Deep Learning & CV** | PyTorch, TorchVision, TorchScript, PIL (Pillow), NumPy |
| **Backend & API** | Python 3.10+, Django 4.2+, Django REST Framework (DRF) |
| **Mobile Frontend** | React Native, Expo (SDK 51), Expo Router, Axios, SecureStore |
| **Administrative UI** | Django Admin, HTML5/CSS3, JavaScript, ReportLab (PDF) |
| **Database** | SQLite3 (Development) / PostgreSQL (Production ready) |
| **DevOps & Containers** | Docker, Docker Compose |

---

## 📁 Repository Structure

```text
.
├── Glaucoma_Detection_Final_Documentation.md  # Detailed technical project documentation
├── org_glaucoma-detection.ipynb               # Original Google Colab training & EDA notebook
├── project/
│   ├── docker-compose.yml                     # Multi-service container orchestration
│   ├── README.md                              # Application runtime documentation
│   ├── frontend/                              # React Native / Expo mobile application
│   │   ├── app/                               # Expo Router file-based screens
│   │   │   ├── _layout.js                     # Root layout & navigation header
│   │   │   ├── apiConfig.js                   # API endpoint configurations
│   │   │   ├── index.js                       # Home & informational dashboard
│   │   │   ├── login.js                       # Clinician authentication screen
│   │   │   ├── profile.js                     # User profile & account details
│   │   │   ├── results.js                     # AI prediction & confidence meter
│   │   │   └── scan.js                        # Camera & gallery image capture
│   │   ├── assets/                            # Brand assets, icons & team photos
│   │   ├── app.json                           # Expo app manifest & configuration
│   │   ├── package.json                       # Mobile npm dependencies
│   │   └── Dockerfile                         # Frontend container definition
│   ├── glaucomaproject/                       # Django backend service
│   │   ├── api/                               # REST API application
│   │   │   ├── admin.py                       # Clinical dashboard customizations
│   │   │   ├── models.py                      # Diagnosis, Referral & Audit models
│   │   │   ├── pdf_utils.py                   # ReportLab PDF report generation
│   │   │   ├── serializers.py                 # DRF model serializers
│   │   │   ├── urls.py                        # API route registrations
│   │   │   └── views.py                       # Inference logic & fundus validation
│   │   ├── glaucomaproject/                   # Core Django project settings
│   │   ├── templates/                         # Web portal and dashboard templates
│   │   ├── manage.py                          # Django management CLI
│   │   ├── requirements.txt                   # Backend Python dependencies
│   │   └── Dockerfile                         # Backend container definition
│   └── trainingfiles/                         # Supplementary training notebooks
│       ├── resNET.ipynb                       # ResNet50 baseline training notebook
│       └── vit_glaucoma_detection.ipynb       # ViT fine-tuning notebook
└── README.md                                  # Repository root overview (this file)
```

---

## 🛠️ Quick Start & Installation

### Option 1: Docker Compose (Recommended)

Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed.

```bash
# Clone the repository
git clone https://github.com/Grantjnr/GROUP_18D.git
cd GROUP_18D/project

# Build and start all services
docker compose up --build
```

* **Backend API:** Available at `http://localhost:8000/`
* **Admin Dashboard:** Available at `http://localhost:8000/admin/`
* **Mobile Metro Bundler:** Available at `http://localhost:8081/`

---

### Option 2: Manual Local Setup

#### 1. Backend Service Setup (Django)

```bash
# Navigate to the backend directory
cd project/glaucomaproject

# Create and activate a Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a clinical administrator account
python manage.py createsuperuser

# Launch the development server
python manage.py runserver 0.0.0.0:8000
```

#### 2. Mobile Client Setup (Expo / React Native)

```bash
# Open a new terminal and navigate to the frontend directory
cd project/frontend

# Install Node modules
npm install

# Start the Expo development server
npx expo start
```

* Scan the QR code using **Expo Go** on Android or the **Camera** app on iOS.
* *Note:* If testing on a physical mobile device, update `project/frontend/app/apiConfig.js` to point to your computer's local LAN IP address (e.g., `http://192.168.x.x:8000`) rather than `localhost`.

---

## 🔌 Core API Endpoints

| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/predict/` | Submit retinal image for validation & ViT prediction | No |
| `POST` | `/api/login/` | Clinician login & authentication token retrieval | No |
| `GET` | `/api/diagnoses/` | Retrieve diagnostic history for logged-in clinician | Yes |
| `GET` | `/api/diagnoses/<id>/pdf/` | Download standardized clinical PDF report | Yes |
| `POST` | `/api/referrals/` | Refer flagged case to a clinical specialist | Yes |
| `GET` | `/api/admin-stats/` | Overview metrics for clinical administrator dashboard | Admin |

### Sample Inference Response (`POST /api/predict/`)

```json
{
  "prediction": "Glaucoma",
  "confidence": 87.42,
  "status": "success",
  "probabilities": {
    "Normal": 0.1258,
    "Glaucoma": 0.8742
  },
  "is_valid_fundus": true,
  "diagnosis_id": 42
}
```

---

## 📜 Academic Declaration

> We, **KWAME OFOSU GRANT**, **BOAKYE OBED FORDJOUR**, **BEMAH REGINA**, **ISHAQ DAUDA**, and **AWONAYA DERRICK**, declare that this project, titled *"A Transfer Learning-Based Vision Transformer (ViT-B/16) System for Early Glaucoma Detection from Retinal Fundus Images,"* is our own original work carried out under the supervision of **Dr. Kwabena Adu** towards the award of a Bachelor of Science degree in Information Technology at the **University of Energy and Natural Resources (UENR)**. All information sources used in producing this work have been duly acknowledged.

---

## 🙏 Acknowledgements

We express our sincere gratitude to:
1. **The Almighty God**, for His divine grace, wisdom, and guidance throughout our studies.
2. **Dr. Kwabena Adu**, our project supervisor, for his invaluable guidance, technical critique, and encouragement.
3. **Prof. Peter Appiahene**, Head of Department of Information Technology and Decision Sciences, and all faculty members for providing the academic foundation that made this research possible.
4. Our families, friends, and the clinical testers who contributed their time to trial and improve the system.
5. All patients fighting preventable blindness across Ghana and globally—this work is dedicated to advancing accessible diagnostic healthcare.

---

## ⚖️ License & Disclaimer

* **Academic Use:** This repository and its accompanying codebase are maintained for academic research, evaluation, and educational demonstration at UENR.
* **Medical Disclaimer:** *Glauco-Guard AI is an experimental AI-assisted screening tool and is NOT a definitive diagnostic instrument. Clinical decisions should always be made by qualified ophthalmologists and eye care professionals.*
