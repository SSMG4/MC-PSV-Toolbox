// --- Theme & Initialization ---
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const button = document.getElementById("theme-button");
    const savedTheme = localStorage.getItem("theme-mode") || "grey";

    body.classList.remove("white-mode", "black-mode", "amoled-mode");
    if (savedTheme !== "grey") body.classList.add(savedTheme);
    
    button.textContent = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1).replace("-mode", "") + " Mode";
});

function toggleThemeMode() {
    const body = document.body;
    const button = document.getElementById("theme-button");
    const themes = ["grey", "white-mode", "black-mode", "amoled-mode"];
    let currentIdx = themes.findIndex(t => body.classList.contains(t) || (t === "grey" && body.classList.length === 0));
    
    let nextIdx = (currentIdx + 1) % themes.length;
    body.classList.remove("white-mode", "black-mode", "amoled-mode");
    if (themes[nextIdx] !== "grey") body.classList.add(themes[nextIdx]);
    
    button.textContent = themes[nextIdx].charAt(0).toUpperCase() + themes[nextIdx].slice(1).replace("-mode", "") + " Mode";
    localStorage.setItem("theme-mode", themes[nextIdx]);
}

// --- Language Logic ---
function changeLanguage() {
    const lang = document.querySelector('.language-dropdown').value;
    const translations = {
        "English": ["Name (Vitacheat Label)", "Custom ID", "Generated Code", "Generate Code", "Copy", "Save", "Erase"],
        "Español": ["Nombre (Etiqueta)", "ID Personalizada", "Código Generado", "Generar Código", "Copiar", "Guardar", "Borrar"],
        "Français": ["Nom (Label)", "ID Personnalisée", "Code Généré", "Générer le Code", "Copier", "Sauvegarder", "Effacer"],
        "日本語": ["コード", "名前", "新しいID", "コードを生成", "コピー", "保存", "全てクリア"]
    };

    const [l1, l2, l3, b1, b2, b3, b4] = translations[lang];
    document.querySelectorAll('.label')[0].innerText = l1;
    document.querySelectorAll('.label')[1].innerText = l2;
    document.querySelector('.title').innerText = l3;
    const buttons = document.querySelectorAll('.button');
    buttons[0].innerText = b1; buttons[1].innerText = b2; buttons[2].innerText = b3; buttons[3].innerText = b4;
}

// --- ID Changer Logic (UTF-8 Little Endian Fix) ---
function button1_Click() {
    const baseAddress = 0x8234628D;
    const customID = document.getElementById('textBox1').value;
    const label = document.getElementById('textBox3').value || "CustomID";
    
    const encoder = new TextEncoder();
    let bytes = Array.from(encoder.encode(customID));
    bytes.push(0); // Null terminator

    let resultLines = [];
    for (let i = 0; i < bytes.length; i += 4) {
        let chunk = bytes.slice(i, i + 4);
        while (chunk.length < 4) chunk.push(0);
        
        // Reverse for Little Endian $0200 format
        let hexValue = chunk.reverse().map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
        let currentAddr = (baseAddress + i).toString(16).toUpperCase();
        resultLines.push(`$0200 ${currentAddr} ${hexValue}`);
        
        if (i >= 24) break; // Memory limit safety
    }

    document.getElementById('textBox2').value = `_V0 ${label}\n${resultLines.join("\n")}`;
}

// --- Improved Save Method (Save File Picker) ---
async function button3_Click() {
    const content = `#${document.getElementById('savefile').value}\n\n${document.getElementById('textBox2').value}`;
    const fileName = `${document.getElementById('savefile').value}.psv`;

    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                types: [{ description: 'VitaCheat File', accept: { 'text/plain': ['.psv'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
        } catch (err) { console.log("Save cancelled or failed"); }
    } else {
        // Fallback for older browsers
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName; a.click();
    }
}

function button2_Click() {
    const output = document.getElementById('textBox2');
    navigator.clipboard.writeText(output.value);
    alert("Code copied to clipboard!");
}

function button4_Click() {
    ['textBox1', 'textBox2', 'textBox3'].forEach(id => document.getElementById(id).value = '');
}

// --- Replace Tool Logic: WORKING MOD MENU STYLE CONVERSIONS ---
document.addEventListener("DOMContentLoaded", function () {
    // Only run if replace tool exists
    if (!document.getElementById("btnBloque") || !document.getElementById("btnObjeto")) return;

    const btnBloque = document.getElementById("btnBloque");
    const bloqueCombo = document.getElementById("bloqueCombo");
    const btnObjeto = document.getElementById("btnObjeto");
    const objetoCombo = document.getElementById("objetoCombo");
    const btnCrearTruco = document.getElementById("btnCrearTruco");
    const resultadoTexto = document.getElementById("resultadoTexto");

    let bloqueSeleccionadoNombre = "";
    let objetoSeleccionadoNombre = "";
    let bloqueSeleccionado = "";
    let objetoSeleccionado = "";

    // List of obtainable items (expand as needed)
    const obtainableItems = {
        "Crafting Table": {
            hex: "83568758",
            name: "Crafting Table"
        },
        "Slime Block": {
            hex: "835684E4",
            name: "Slime Block"
        }
        // Add more obtainable items as needed
    };

    // List of unobtainable items and their full cheats (expand as needed)
    // Use the mod menu format here!
    const unobtainableItems = {
        "Command Block": {
            name: "Command Block",
            codes: [
                "$5200 8399A634 83568758",
                "$0200 8399A62C 00000040"
                // Add more lines if needed for full conversion
            ]
        },
        "Nether Portal": {
            name: "Nether Portal",
            codes: [
                "$5200 8399C4A4 83568ACC",
                "$0200 8399C49C 00000040"
                // Example, expand for real menu
            ]
        }
        // Add more unobtainable items (with full codes array) as needed
    };

    // Block selection
    btnBloque.addEventListener("click", function () {
        const selectedBloqueText = bloqueCombo.options[bloqueCombo.selectedIndex].text;
        bloqueSeleccionado = obtainableItems[selectedBloqueText]?.hex || "";
        bloqueSeleccionadoNombre = obtainableItems[selectedBloqueText]?.name || selectedBloqueText;
    });

    // Object selection
    btnObjeto.addEventListener("click", function () {
        const selectedObjetoText = objetoCombo.options[objetoCombo.selectedIndex].text;
        objetoSeleccionadoNombre = unobtainableItems[selectedObjetoText]?.name || selectedObjetoText;
        objetoSeleccionado = selectedObjetoText;
    });

    // Cheat generation: name is "[from] to [to]", codes use unobtainable item mod menu section
    btnCrearTruco.addEventListener("click", function () {
        if (!bloqueSeleccionadoNombre) {
            const selectedBloqueText = bloqueCombo.options[bloqueCombo.selectedIndex].text;
            bloqueSeleccionado = obtainableItems[selectedBloqueText]?.hex || "";
            bloqueSeleccionadoNombre = obtainableItems[selectedBloqueText]?.name || selectedBloqueText;
        }
        if (!objetoSeleccionadoNombre) {
            const selectedObjetoText = objetoCombo.options[objetoCombo.selectedIndex].text;
            objetoSeleccionadoNombre = unobtainableItems[selectedObjetoText]?.name || selectedObjetoText;
            objetoSeleccionado = selectedObjetoText;
        }
    
        const unobtainable = unobtainableItems[objetoSeleccionado];
        if (!unobtainable) {
            resultadoTexto.value = "Unobtainable item codes not found.";
            return;
        }
    
        const trucoName = `${bloqueSeleccionadoNombre} → ${objetoSeleccionadoNombre}`;
        let codeBlock = `_V0 ${trucoName}\n`;
    
        // Registry + inventory patch
        codeBlock += unobtainable.codes.map(line => {
            return line.replace(/(\$5200\s+[0-9A-F]+\s+)([0-9A-F]{8})/i, (_, pre) => {
                return pre + bloqueSeleccionado;
            });
        }).join("\n");
    
        // Add creative inventory patch (ensures menu shows correct block)
        codeBlock += `\n$0200 ${bloqueSeleccionado} 00000040`;
    
        resultadoTexto.value = codeBlock;
    });
});



