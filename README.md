# StudyBuddy: Your AI-Powered Study Companion

StudyBuddy is an AI-powered study companion designed to help you learn and understand complex topics effectively. Leveraging the power of Google's Gemini AI model, StudyBuddy provides helpful, respectful, and educational responses to your study-related queries.

## Features

- **AI-Powered Responses:** Get instant answers and explanations to your study questions using the advanced Gemini AI model.
- **Educational Focus:** StudyBuddy is specifically trained to focus on study-related topics, keeping the conversation productive and relevant.
- **Interactive Chat Interface:** Enjoy a seamless and intuitive chat experience, making learning engaging and enjoyable.
- **Reset Conversation:** Start fresh anytime by clearing the chat history and resetting the conversation.
- **File Uploads (Image/PDF/Text):** Upload files for context and more tailored responses. (Experimental; AI's ability to process these effectively is still developing.)

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Afnanksalal/studdybuddy.git
cd studybuddy
```

### Install Dependencies

```bash
pnpm install
```

### Set Up Environment Variables

Create a `.env` file in the root directory and add your Google Generative AI API key:

```env
NEXT_PUBLIC_APIKEY=YOUR_API_KEY
```

### Run the Development Server

```bash
pnpm run dev
```

## How to Use

### Ask Questions

Type your study-related questions in the chat input area and press `Enter` or click `Send`.

### Upload Files

Click the paperclip icon to upload images, PDFs, or text files related to your questions. (Experimental; AI's ability to process these effectively is still developing.)

### Review Responses

StudyBuddy will provide AI-generated answers and explanations in the chat area.

### Reset Conversation

Click the trash can icon to clear the chat history and start a new conversation.

## Tech Stack

- **Next.js:** React framework for server-side rendered and static web applications.
- **Google Generative AI:** Provides the underlying AI model (Gemini) for generating responses.
- **React Markdown:** Renders markdown content in the chat interface.
- **Lucide React:** Provides beautiful icons for the user interface.
- **Tailwind CSS & DaisyUI:** Styling and UI component library.

## Contributing

Contributions are welcome! Please feel free to open issues and submit pull requests.

## License

This project is licensed under the MIT License.
