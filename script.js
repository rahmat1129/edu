const API_KEY = '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';  // Replace with your OpenRouter API key
        const API_KEY1 = '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';
        const USERNAME = 'rahmat1129';
        const REPO_NAME = 'edu';
        const SITE_URL = 'http://localhost:7700/gemini%20chatbot.html';
        const SITE_NAME = 'Sameer';
        let generatedHTML = '';
        let fileContentHTML = ''; // To store uploaded file content
        const history = [];
        let streamFinished = false; // Flag to track stream completion
        let selectedModel = "google/gemini-2.0-pro-exp-02-05:free"; // Default model


        function handleModelChange() {
           selectedModel = document.getElementById("modelSelect").value;
        }

        // Function to open the selected tab
       function openTab(tabName) {
          const tabContents = document.getElementsByClassName('tab-content');
          const tabButtons = document.getElementsByClassName('tab-button');


          for (let i = 0; i < tabContents.length; i++) {
              tabContents[i].classList.add('hidden');
              tabButtons[i].classList.remove('active');
          }

          document.getElementById(tabName + 'Tab').classList.remove('hidden');
           // Find the button that corresponds to the tabName and add 'active' class
           for (let i = 0; i < tabButtons.length; i++) {
              if (tabButtons[i].textContent.toLowerCase() === tabName) {
                 tabButtons[i].classList.add('active');
                break; // Exit the loop once the correct button is found
              }
           }

          if (tabName === 'upload') {
              clearUploadTab();
          }
      }

        async function generateCode() {
            streamFinished = false;
            const prompt = document.getElementById('userPrompt').value.trim();
            if (!prompt) return;

            const codeContainer = document.getElementById('codeContainer');
            const generatedCode = document.getElementById('generatedCode');
            const codePreview = document.getElementById('codePreview');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progress');
            const progressText = document.getElementById('progressText');

            generatedCode.textContent = '';
            codeContainer.style.display = 'block';
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '0%';
            progressText.textContent = '0%';

            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = 'Generating code...';
            generatedCode.appendChild(loading);

            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "HTTP-Referer": SITE_URL,
                        "X-Title": SITE_NAME,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": selectedModel, // Use selected model
                        "messages": [{"role": "user", "content": `Generate HTML code and use telwind css and high quality code and advance fully futuresed : ${prompt} write a complete html code in one html file 
                        futures:- animation, icons, meta tags, 
                        notes:- Nothing was made about the code, just the code, without any explanation write a text on footer made by Sameer website developer`}],
                        stream: true,
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                loading.remove();

                const reader = response.body.getReader();
                let decoder = new TextDecoder();
                let buffer = '';


                while (!streamFinished) {
                    const { done, value } = await reader.read();

                    if (done) {
                        streamFinished = true;
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    let boundary = buffer.lastIndexOf('\n');
                    if (boundary !== -1) {
                        let completeData = buffer.substring(0, boundary);
                        buffer = buffer.substring(boundary + 1);

                        const dataChunks = completeData.split('data: ').filter(chunk => chunk.trim() !== '');

                        dataChunks.forEach(chunk => {
                            try {
                                const jsonData = JSON.parse(chunk);
                                if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                    const content = jsonData.choices[0].delta.content;
                                    generatedHTML += content;
                                    generatedCode.textContent = generatedHTML;
                                    Prism.highlightElement(generatedCode);
                                    codePreview.srcdoc = generatedHTML;
                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error, chunk);
                            }
                        });
                    }
                }
                Prism.highlightElement(generatedCode);
                codePreview.srcdoc = generatedHTML;

                savePrompt(prompt);

            } catch (error) {
                loading.remove();
                generatedCode.textContent = `Error: ${error.message}`;
                codePreview.srcdoc = '';
            } finally {
                 setTimeout(() => {
                   progressContainer.classList.add('hidden');
                 }, 1000);

            }
        }




        function copyCode() {
            const code = document.getElementById('generatedCode').textContent;
            navigator.clipboard.writeText(code)
                .then(() => alert('Code copied to clipboard!'))
                .catch(err => console.error('Copy failed:', err));
        }


        function downloadCode() {
            const code = document.getElementById('generatedCode').textContent;
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated_code.html';
            a.click();

            URL.revokeObjectURL(url);
        }
        function clearAll() {
            document.getElementById('userPrompt').value = '';
            document.getElementById('generatedCode').textContent = '';
            document.getElementById('codeContainer').style.display = 'none';
            document.getElementById('codePreview').srcdoc = '';
            document.getElementById('uploadLinkContainer').classList.add('hidden');
            document.getElementById('previousCodeContainer').classList.add('hidden');
             document.getElementById('modifyContainer').classList.add('hidden');
            document.getElementById('modificationPrompt').value = '';


        }

        function refreshPreview() {
            document.getElementById('codePreview').srcdoc = generatedHTML;
        }


        function toggleMode() {
          document.body.classList.toggle('dark-mode');
        }

        function savePrompt(prompt) {
            history.push(prompt);
            updateHistory();
        }


      function updateHistory() {
        const historyItems = document.getElementById('historyItems');
        historyItems.innerHTML = '';
        for (let i = history.length - 1; i >= 0; i--) {
          const item = history[i];
          const div = document.createElement('div');
          div.className = 'history-item';
          div.textContent = item;
          div.onclick = () => loadPrompt(i);
          historyItems.appendChild(div);
        }
      }

       function loadPrompt(index) {
            document.getElementById('userPrompt').value = history[index];
        }

          function showUploadForm() {
            document.getElementById('uploadContainer').classList.toggle('hidden');
        }
          function showModifyForm() {
             document.getElementById('modifyContainer').classList.remove('hidden');
        }


        function toggleEditCode() {
            const generatedCode = document.getElementById('generatedCode');
            const editableCode = document.getElementById('editableCode');
            if (editableCode.classList.contains('hidden')) {
                editableCode.value = generatedCode.textContent;
                generatedCode.classList.add('hidden');
                editableCode.classList.remove('hidden');
            } else {
                generatedCode.textContent = editableCode.value;
                Prism.highlightElement(generatedCode);
                generatedCode.classList.remove('hidden');
                editableCode.classList.add('hidden');
                 refreshPreview();
            }
        }

       async function uploadToGitHub() {
            const token = API_KEY1;
            const repo = `${USERNAME}/${REPO_NAME}`;
            const path = document.getElementById('filePath').value.trim();
            const content = btoa(generatedHTML);

            if (!path) {
                alert('Please fill in the file path.');
                return;
            }


             try {
                const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        "Authorization": `token ${token}`,
                        "Content-Type": "application/json"
                     },
                     body: JSON.stringify({
                         message: "Add generated HTML code",
                         content: content
                     })
                 });

                 if (response.ok) {
                     const data = await response.json();
                    const linkContainer = document.getElementById('uploadLinkContainer');
                    const uploadedLink = document.getElementById('uploadedLink');
                     const fileName = path.split('/').pop();
                     uploadedLink.href = `https://rahmat1129.github.io/edu/${fileName}`;
                    uploadedLink.textContent = `https://rahmat1129.github.io/edu/${fileName}`;

                      linkContainer.classList.remove('hidden');
                     alert('File uploaded successfully!');
                 } else {
                     const error = await response.json();
                    alert('Error: ' + error.message);
                 }
             } catch (error) {
                 alert('Error: ' + error.message);
             }
         }

        function copyLink() {
             const link = document.getElementById('uploadedLink').href;
             navigator.clipboard.writeText(link)
                .then(() => alert('Link copied to clipboard!'))
                 .catch(err => console.error('Copy failed:', err));
        }

        async function modifyCode() {
            streamFinished = false;
            const modificationPrompt = document.getElementById('modificationPrompt').value.trim();
            if (!modificationPrompt) return;

            const codeContainer = document.getElementById('codeContainer');
            const previousCodeContainer = document.getElementById('previousCodeContainer');
            const previousCode = document.getElementById('previousCode');
            const generatedCode = document.getElementById('generatedCode');
            const codePreview = document.getElementById('codePreview');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progress');
            const progressText = document.getElementById('progressText');


            previousCode.textContent = generatedHTML;
            previousCodeContainer.classList.remove('hidden');
            Prism.highlightElement(previousCode);

            generatedCode.textContent = '';
            codeContainer.style.display = 'block';
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '0%';
            progressText.textContent = '0%';

            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = 'Modifying code...';
            generatedCode.appendChild(loading);

          try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                "model": selectedModel, // Use selected model.
                "messages": [
                  { "role": "user", "content": `Here is the current HTML code: ${generatedHTML}` },
                  { "role": "user", "content": `Make the following changes: ${modificationPrompt}` }
                ],
                stream: true,
              })
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
             loading.remove();


              const reader = response.body.getReader();
                let decoder = new TextDecoder();
                let buffer = '';
                generatedHTML = ''; // Clear previous generated HTML

                while (!streamFinished) {
                    const { done, value } = await reader.read();

                    if (done) {
                        streamFinished = true;
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    let boundary = buffer.lastIndexOf('\n');
                    if (boundary !== -1) {
                        let completeData = buffer.substring(0, boundary);
                        buffer = buffer.substring(boundary + 1);

                        const dataChunks = completeData.split('data: ').filter(chunk => chunk.trim() !== '');

                        dataChunks.forEach(chunk => {
                            try {
                                const jsonData = JSON.parse(chunk);
                                if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                    const content = jsonData.choices[0].delta.content;
                                    generatedHTML += content; // Append new content
                                    generatedCode.textContent = generatedHTML;
                                    Prism.highlightElement(generatedCode);
                                    codePreview.srcdoc = generatedHTML;
                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error, chunk);
                            }
                        });
                    }
                }

                Prism.highlightElement(generatedCode);
                codePreview.srcdoc = generatedHTML;


          } catch (error) {
            loading.remove();
            generatedCode.textContent = `Error: ${error.message}`;
            codePreview.srcdoc = '';
          }finally {
                 setTimeout(() => {
                   progressContainer.classList.add('hidden');
                 }, 1000);

            }
        }

        async function handleFileSelect() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            if (!file) return;

             //Image Preview
            if (file.type.startsWith('image/')) {
               const reader = new FileReader();
                reader.onload = function(e){
                    const imagePreview = document.getElementById('imagePreview');
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                     document.getElementById('imagePreviewContainer').classList.remove('hidden');
                }
                reader.readAsDataURL(file);
            }else{
                 document.getElementById('imagePreview').style.display = 'none';

                  // Clear previous content.
                 clearUploadTab();
                await processFile(file);
            }
        }

          async function processFile(file){
            const fileContentContainer = document.getElementById('fileContentContainer');
            const fileContentElement = document.getElementById('fileContent');
             const uploadResponseElement = document.getElementById('uploadResponse');



            fileContentElement.textContent = '';
            fileContentContainer.classList.remove('hidden');


              if (file.type === 'text/plain' || file.type === 'text/html' || file.type === 'text/css' || file.type === 'application/javascript') {
                const reader = new FileReader();

                reader.onload = function(e){
                    fileContentHTML = e.target.result;
                    fileContentElement.textContent = fileContentHTML;
                     Prism.highlightElement(fileContentElement); // Apply syntax highlighting
                 }
              reader.readAsText(file)
           }
             else {
                // For non-text files, attempt to use the OpenRouter API
                await uploadAndProcessWithOpenRouter(file);
        }
    }



        async function uploadAndProcessWithOpenRouter(file){
             const uploadResponseElement = document.getElementById('uploadResponse');
              const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progress');
            const progressText = document.getElementById('progressText');
              const fileContentElement = document.getElementById('fileContent');


            progressContainer.classList.remove('hidden');
             progressBar.style.width = '0%';
            progressText.textContent = '0%';
             uploadResponseElement.textContent = "Uploading and processing file...";
             uploadResponseElement.classList.remove('hidden');

             try{

                  const base64Content = await fileToBase64(file);

                 const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                     method: "POST",
                      headers:{
                        "Authorization": `Bearer ${API_KEY}`,
                        "HTTP-Referer": SITE_URL,
                        "X-Title": SITE_NAME,
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        "model": selectedModel,
                        "messages": [{
                            "role": "user",
                          "content": [
                              {
                                 "type":"text",
                                 "text": "Please process this file and return the content.  Be as accurate as possible in transcribing any text within the file (e.g., from an image)."
                              },
                              {
                                "type": "file_url",
                                "file_url": {
                                    "url" : base64Content
                                }
                              }
                          ]
                        }],
                         stream:true,
                      })
                 })

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                let decoder = new TextDecoder();
                let buffer = '';
                fileContentHTML = '';
                uploadResponseElement.textContent = "Processing file content...";

             while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    let boundary = buffer.lastIndexOf('\n');
                    if (boundary !== -1) {
                        let completeData = buffer.substring(0, boundary);
                        buffer = buffer.substring(boundary + 1);

                        const dataChunks = completeData.split('data: ').filter(chunk => chunk.trim() !== '');

                        dataChunks.forEach(chunk => {
                            try {
                                const jsonData = JSON.parse(chunk);
                                if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                    const content = jsonData.choices[0].delta.content;
                                    fileContentHTML += content;
                                     fileContentElement.textContent = fileContentHTML;
                                    Prism.highlightElement(fileContentElement);

                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error, chunk);
                            }
                        });
                    }
                }

               uploadResponseElement.textContent = "File processing complete."
              document.getElementById('fileModifyContainer').classList.remove('hidden'); // Show the modify upload form

               }catch(error){
                 console.error("Error processing file:", error);
                uploadResponseElement.textContent = `Error processing file:: ${error.message}`;
             }finally{
               setTimeout(()=>{
                 progressContainer.classList.add('hidden')
               },1000)
             }

        }


      function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
      }



       async function modifyUploadedCode() {
           const modificationPrompt = document.getElementById('fileModificationPrompt').value.trim();
           if(!modificationPrompt) return;

            const codeContainer = document.getElementById('codeContainer');
            const fileContentContainer =   document.getElementById('fileContentContainer');
            const generatedCode = document.getElementById('generatedCode');
            const codePreview = document.getElementById('codePreview');
             const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progress');
            const progressText = document.getElementById('progressText');
              const uploadResponseElement = document.getElementById('uploadResponse')

            // Set up the UI
            generatedCode.textContent = '';
            codeContainer.style.display = 'block';
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '0%';
             progressText.textContent = '0%';
            uploadResponseElement.textContent = "Applying modification to the file...";
            uploadResponseElement.classList.remove('hidden');

             try {
               const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  "Authorization": `Bearer ${API_KEY}`,
                  "HTTP-Referer": SITE_URL,
                  "X-Title": SITE_NAME,
                  "Content-Type": "application/json"
                 },
                 body: JSON.stringify({
                   "model": selectedModel, // Use selected model
                   "messages": [
                    {"role": "user", "content": `Here is the current file content: ${fileContentHTML}`}, // Use file content.
                    { "role": "user", "content": `Make the following changes: ${modificationPrompt} without any explanation only code ` }
                   ],
                   stream: true,
                 })
               });
                 if (!response.ok) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                  }

            const reader = response.body.getReader();
            let decoder = new TextDecoder();
            let buffer = '';
             fileContentHTML = ''; // Reset for modified content.

             while (true) {

               const {done, value} = await reader.read();
               if(done) break;


               buffer += decoder.decode(value, {stream:true});
                let boundary = buffer.lastIndexOf('\n')
               if(boundary !== -1){
                 let completeData = buffer.substring(0, boundary);
                 buffer = buffer.substring(boundary + 1);

                 const dataChunks = completeData.split('data: ').filter(chunk => chunk.trim() !== '');
                dataChunks.forEach(chunk =>{

                    try{
                      const jsonData = JSON.parse(chunk);
                       if(jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content){
                         const content = jsonData.choices[0].delta.content;

                          fileContentHTML += content;

                           generatedCode.textContent = fileContentHTML;
                            Prism.highlightElement(generatedCode);

                           codePreview.srcdoc = fileContentHTML


                       }
                    }catch(error){
                      console.error("Error parsing JSON : ", error, chunk)
                    }
                })
               }

             }
              Prism.highlightElement(generatedCode);
              codePreview.srcdoc = fileContentHTML;

               uploadResponseElement.textContent = "Modification completed";
               fileContentContainer.classList.add('hidden');


           }catch(error){
            console.error("Error during file modification:", error);
            uploadResponseElement.textContent =`Error during modification : ${error.message}`
           }finally{
              setTimeout(() => {
                progressContainer.classList.add('hidden');
                uploadResponseElement.classList.add('hidden')
              }, 1000);
           }
       }

       function clearUploadTab() {
        // Clear file input
        document.getElementById('fileInput').value = '';

        // Clear and hide file content display
        const fileContentElement = document.getElementById('fileContent');
        fileContentElement.textContent = '';
        document.getElementById('fileContentContainer').classList.add('hidden');

        // Clear and hide upload response
         const uploadResponseElement = document.getElementById('uploadResponse');
        uploadResponseElement.textContent = '';
        uploadResponseElement.classList.add('hidden');

          //Clear and hide image preview
         const imagePreview =   document.getElementById('imagePreview');
          imagePreview.src = "";
          imagePreview.style.display = 'none';
           document.getElementById('imagePreviewContainer').classList.add('hidden');

           // Hide file modification container
         document.getElementById('fileModifyContainer').classList.add('hidden');
         document.getElementById('fileModificationPrompt').value = '';

    }
