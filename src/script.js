const recipesView = document.getElementById("recipes-view");
const editRecipeView = document.getElementById("edit-recipe-view");
const recipeDetailView = document.getElementById("recipe-detail-view");
const emptyState = document.getElementById("empty-state");
const recipesContainer = document.getElementById("recipes-container");
const recipeForm = document.getElementById("recipe-form");
const themeSelector = document.getElementById("theme-selector");
const searchContainer = document.getElementById("search-container");
const searchInput = document.getElementById("search-input");
const clearSearch = document.getElementById("clear-search");
const settingsPanel = document.getElementById("settings-panel");
const openMenuBtn = document.getElementById("open-menu-btn");

const menuBtn = document.getElementById("menu-btn");
const searchBtn = document.getElementById("search-btn");
const sortBtn = document.getElementById("sort-btn");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const backToListBtn = document.getElementById("back-to-list-btn");
const saveRecipeBtn = document.getElementById("save-recipe-btn");
const addIngredientBtn = document.getElementById("add-ingredient-btn");
const addStepBtn = document.getElementById("add-step-btn");
const editCurrentRecipeBtn = document.getElementById(
    "edit-current-recipe-btn"
);
const deleteCurrentRecipeBtn = document.getElementById(
    "delete-current-recipe-btn"
);
const resetAllBtn = document.getElementById("reset-all-btn");
const exportDataBtn = document.getElementById("export-data-btn");
const importDataBtn = document.getElementById("import-data-btn");
const menuAddRecipe = document.getElementById("menu-add-recipe");

const confirmModal = document.getElementById("confirm-modal");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmOk = document.getElementById("confirm-ok");

let recipes = [];
let currentRecipeId = null;
let currentSortMethod = "date-new";
let currentSearchQuery = "";
let currentServings = 4;
let detailServings = 4;

document.addEventListener("DOMContentLoaded", () => {
    setupRippleEffects();
    loadRecipes();
    setupEventListeners();
    checkThemePreference();
    checkWebViewEnvironment();
});

function checkWebViewEnvironment() {
    const isWebView =
        /(Android|iPhone|iPad).*Version\/[\d.]+.*(Chrome|Safari)/i.test(
            navigator.userAgent
        ) && !/(Chrome|Safari)/i.test(navigator.userAgent);

    if (isWebView) {
        console.log(
            "WebView ortamında çalışıyor - localStorage etkin olmalı"
        );
        try {
            localStorage.setItem("test", "test");
            localStorage.removeItem("test");
        } catch (e) {
            console.error("localStorage kullanılamıyor:", e);
            showNotification(
                "Tarifler kaydedilemiyor - localStorage erişimi yok",
                "error"
            );
        }
    }
}

function setupRippleEffects() {
    document.querySelectorAll(".ripple").forEach((button) => {
        button.addEventListener("click", function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement("span");
            ripple.className = "ripple-effect";
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function loadRecipes() {
    try {
        const savedRecipes = localStorage.getItem("recipes");
        if (savedRecipes) {
            recipes = JSON.parse(savedRecipes);
            sortRecipes(currentSortMethod);
            renderRecipes();
        } else {
            recipes = [];
            renderRecipes();
        }
        updateEmptyState();
    } catch (e) {
        console.error("Tarifler yüklenirken hata:", e);
        showNotification("Tarifler yüklenirken hata oluştu", "error");
        recipes = [];
        renderRecipes();
    }
}

function saveRecipes() {
    try {
        localStorage.setItem("recipes", JSON.stringify(recipes));
        updateEmptyState();
    } catch (e) {
        console.error("Tarifler kaydedilirken hata:", e);
        showNotification("Tarifler kaydedilirken hata oluştu", "error");
    }
}

function sortRecipes(method) {
    currentSortMethod = method;
    switch (method) {
        case "name-asc":
            recipes.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            recipes.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "date-new":
            recipes.sort((a, b) => parseInt(b.id) - parseInt(a.id));
            break;
        case "date-old":
            recipes.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            break;
        default:
            recipes.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
}

function filterRecipes(query) {
    currentSearchQuery = query.toLowerCase();
    renderRecipes();
}

function renderRecipes() {
    recipesContainer.innerHTML = "";

    if (recipes.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    let filteredRecipes = [...recipes];

    if (currentSearchQuery) {
        filteredRecipes = filteredRecipes.filter(
            (recipe) =>
                recipe.name.toLowerCase().includes(currentSearchQuery) ||
                (recipe.description &&
                    recipe.description
                        .toLowerCase()
                        .includes(currentSearchQuery)) ||
                recipe.ingredients.some((ing) =>
                    ing.toLowerCase().includes(currentSearchQuery)
                ) ||
                recipe.steps.some((step) =>
                    step.toLowerCase().includes(currentSearchQuery)
                )
        );

        if (filteredRecipes.length === 0) {
            recipesContainer.innerHTML = `
                        <div class="empty-state-container">
                            <div class="empty-state-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <h3 class="empty-state-title">Tarif bulunamadı</h3>
                            <p class="empty-state-subtitle">Farklı bir arama terimi deneyin</p>
                        </div>
                    `;
            return;
        }
    }

    filteredRecipes.forEach((recipe) => {
        const recipeCard = document.createElement("div");
        recipeCard.className = "card recipe-card-mobile";
        recipeCard.dataset.id = recipe.id;
        recipeCard.classList.add("fade-in");

        recipeCard.innerHTML = `
                    <img src="${recipe.image ||
            "https://xmeroriginals.github.io/myrecipes/assets/nopic.png"
            }" 
                         alt="${recipe.name}">
                    <div class="recipe-card-mobile-content">
                        <h3 class="recipe-card-mobile-title">${recipe.name}</h3>
                        <p class="recipe-card-mobile-desc">${recipe.description || "Açıklama yok"
            }</p>
                        <div class="recipe-card-mobile-meta">
                            <span><i class="fas fa-list-ul"></i> ${recipe.ingredients.length
            } malzeme</span>
                            <span class="mx-2">•</span>
                            <span><i class="fas fa-clock"></i> ${Math.max(
                15,
                Math.min(recipe.ingredients.length, 120)
            )} dk</span>
                        </div>
                    </div>
                `;

        recipeCard.addEventListener("click", () => viewRecipe(recipe.id));
        recipesContainer.appendChild(recipeCard);
    });
}

function viewRecipe(id) {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;

    currentRecipeId = id;
    detailServings = recipe.servings || 4;

    document.getElementById("detail-recipe-name").textContent = recipe.name;
    document.getElementById("detail-recipe-description").textContent =
        recipe.description || "";
    document.getElementById("detail-recipe-image").src =
        recipe.image ||
        "https://xmeroriginals.github.io/myrecipes/assets/nopic.png";

    const ingredientsList = document.getElementById(
        "detail-ingredients-list"
    );
    ingredientsList.innerHTML = "";
    recipe.ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.className = "flex items-start";
        li.innerHTML = `
                    <span class="text-accent mr-3 mt-1">•</span>
                    <span>${ingredient}</span>
                `;
        ingredientsList.appendChild(li);
    });

    const stepsList = document.getElementById("detail-steps-list");
    stepsList.innerHTML = "";
    recipe.steps.forEach((step, index) => {
        const li = document.createElement("li");
        li.className = "flex items-start";
        li.innerHTML = `
                    <span class="bg-[var(--accent)] text-white rounded-full w-6 h-6 flex items-center justify-center mt-1 mr-3 text-sm">${index + 1
            }</span>
                    <span>${step}</span>
                `;
        stepsList.appendChild(li);
    });

    recipesView.classList.add("hidden");
    recipeDetailView.classList.remove("hidden");
    recipeDetailView.classList.add("fade-in");
}

function showEditForm(recipe = null) {
    recipeForm.reset();
    document.getElementById("ingredients-container").innerHTML = "";
    document.getElementById("steps-container").innerHTML = "";

    if (recipe) {
        document.getElementById("edit-recipe-title").textContent =
            "Tarifi Düzenle";
        document.getElementById("recipe-id").value = recipe.id;
        document.getElementById("recipe-name").value = recipe.name;
        document.getElementById("recipe-description").value =
            recipe.description || "";
        document.getElementById("recipe-preview").src =
            recipe.image ||
            "https://xmeroriginals.github.io/myrecipes/assets/nopic.png";
        currentServings = recipe.servings || 4;

        recipe.ingredients.forEach((ingredient) => {
            addIngredientField(ingredient);
        });

        recipe.steps.forEach((step) => {
            addStepField(step);
        });

        currentRecipeId = recipe.id;
    } else {
        document.getElementById("edit-recipe-title").textContent =
            "Yeni Tarif Ekle";
        document.getElementById("recipe-preview").src =
            "https://xmeroriginals.github.io/myrecipes/assets/nopic.png";
        currentServings = 4;
        addIngredientField();
        addStepField();
        currentRecipeId = null;
    }

    recipesView.classList.add("hidden");
    editRecipeView.classList.remove("hidden");
    editRecipeView.classList.add("fade-in");
    document.getElementById("recipe-name").focus();
}

function addIngredientField(value = "") {
    const container = document.getElementById("ingredients-container");
    const div = document.createElement("div");
    div.className = "ingredient-item flex items-center";
    div.innerHTML = `
                <input type="text" placeholder="Malzeme" value="${value}"
                       class="flex-1 p-3 rounded-lg modern-input">
                <button type="button" class="delete-ingredient-btn ml-2 text-red-500 p-2 ripple">
                    <i class="fas fa-times"></i>
                </button>
            `;
    container.appendChild(div);

    const deleteBtn = div.querySelector(".delete-ingredient-btn");
    deleteBtn.addEventListener("click", () => {
        if (document.querySelectorAll(".ingredient-item").length > 1) {
            div.remove();
        } else {
            showNotification(
                "Bir tarifin en az bir malzemesi olmalı",
                "warning"
            );
        }
    });

    div.querySelector("input").focus();
}

function addStepField(value = "") {
    const container = document.getElementById("steps-container");
    const div = document.createElement("div");
    div.className = "step-item flex items-start";

    const stepNumber = container.children.length + 1;

    div.innerHTML = `
                <span class="bg-[var(--accent)] text-white rounded-full w-6 h-6 flex items-center justify-center mt-1 mr-3 text-sm">${stepNumber}</span>
                <textarea placeholder="Adım açıklaması" rows="2"
                          class="flex-1 p-3 rounded-lg modern-input mt-1">${value}</textarea>
                <button type="button" class="delete-step-btn ml-2 text-red-500 p-2 mt-3 ripple">
                    <i class="fas fa-times"></i>
                </button>
            `;
    container.appendChild(div);

    const deleteBtn = div.querySelector(".delete-step-btn");
    deleteBtn.addEventListener("click", () => {
        if (document.querySelectorAll(".step-item").length > 1) {
            div.remove();
            updateStepNumbers();
        } else {
            showNotification("Bir tarifin en az bir adımı olmalı", "warning");
        }
    });

    div.querySelector("textarea").focus();
}

function updateStepNumbers() {
    const steps = document.querySelectorAll(".step-item");
    steps.forEach((step, index) => {
        const numberSpan = step.querySelector("span");
        numberSpan.textContent = index + 1;
    });
}

function saveRecipe() {
    const id =
        document.getElementById("recipe-id").value || Date.now().toString();
    const name = document.getElementById("recipe-name").value.trim();
    const description = document
        .getElementById("recipe-description")
        .value.trim();
    const image = document.getElementById("recipe-preview").src;
    const servings = currentServings;

    if (!name) {
        showNotification("Lütfen bir tarif adı girin", "warning");
        document.getElementById("recipe-name").focus();
        return;
    }

    const ingredients = [];
    document.querySelectorAll(".ingredient-item input").forEach((input) => {
        const value = input.value.trim();
        if (value) ingredients.push(value);
    });

    if (ingredients.length === 0) {
        showNotification("Lütfen en az bir malzeme ekleyin", "warning");
        return;
    }

    const steps = [];
    document.querySelectorAll(".step-item textarea").forEach((textarea) => {
        const value = textarea.value.trim();
        if (value) steps.push(value);
    });

    if (steps.length === 0) {
        showNotification("Lütfen en az bir adım ekleyin", "warning");
        return;
    }

    const recipe = {
        id,
        name,
        description,
        image: image.includes("unsplash.com") ? "" : image,
        ingredients,
        steps,
        servings,
        createdAt: new Date().toISOString(),
    };

    const existingIndex = recipes.findIndex((r) => r.id === id);
    if (existingIndex >= 0) {
        recipes[existingIndex] = recipe;
    } else {
        recipes.unshift(recipe);
    }

    sortRecipes(currentSortMethod);
    saveRecipes();
    renderRecipes();
    showNotification("Tarif başarıyla kaydedildi", "success");

    backToList();
}

function deleteRecipe(id) {
    recipes = recipes.filter((recipe) => recipe.id !== id);
    saveRecipes();
    renderRecipes();
    showNotification("Tarif silindi", "success");

    if (currentRecipeId === id) {
        backToList();
    }
}

function resetAllRecipes() {
    recipes = [];
    saveRecipes();
    renderRecipes();
    showNotification("Tüm tarifler silindi", "success");
    backToList();
}

function exportRecipes() {
    const data = JSON.stringify(recipes, null, 2);
    window.NativeInterface.saveDataToFile(
        "Modern-Tarifler-yedek.json",
        data
    );
}

function importRecipes(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedRecipes = JSON.parse(e.target.result);
            if (Array.isArray(importedRecipes)) {
                recipes = importedRecipes;
                sortRecipes(currentSortMethod);
                saveRecipes();
                renderRecipes();
                showNotification(
                    `${importedRecipes.length} tarif başarıyla içe aktarıldı`,
                    "success"
                );
            } else {
                showNotification("Geçersiz tarif dosyası", "error");
            }
        } catch (error) {
            console.error("Tarifler içe aktarılırken hata:", error);
            showNotification("Tarif dosyası okunurken hata oluştu", "error");
        }
    };
    reader.onerror = () => {
        showNotification("Dosya okunurken hata oluştu", "error");
    };
    reader.readAsText(file);
}

function showNotification(message, type = "info") {

    const existing = document.querySelector(".notification");
    if (existing) existing.remove();
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    let icon;
    switch (type) {
        case "success":
            icon = "fa-check-circle";
            break;
        case "error":
            icon = "fa-exclamation-circle";
            break;
        case "warning":
            icon = "fa-exclamation-triangle";
            break;
        default:
            icon = "fa-info-circle";
    }

    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function backToList() {
    recipesView.classList.remove("hidden");
    editRecipeView.classList.add("hidden");
    recipeDetailView.classList.add("hidden");
    settingsPanel.classList.remove("active");

    searchContainer.classList.add("hidden");
    currentSearchQuery = "";
    searchInput.value = "";
}

function updateEmptyState() {
    if (recipes.length === 0) {
        emptyState.classList.remove("hidden");
        recipesContainer.classList.add("hidden");
    } else {
        emptyState.classList.add("hidden");
        recipesContainer.classList.remove("hidden");
    }
}

function checkThemePreference() {
    const savedTheme = localStorage.getItem("theme") || "system";
    themeSelector.value = savedTheme;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === "system") {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.toggle("dark", prefersDark);
        document.documentElement.classList.toggle("light", !prefersDark);
    } else {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
}

function toggleSettingsPanel() {
    settingsPanel.classList.toggle("active");
}

function setupEventListeners() {

    menuBtn.addEventListener("click", toggleSettingsPanel);
    openMenuBtn.addEventListener("click", toggleSettingsPanel);

    searchBtn.addEventListener("click", () => {
        searchContainer.classList.toggle("hidden");
        if (!searchContainer.classList.contains("hidden")) {
            searchInput.focus();
        }
    });
    sortBtn.addEventListener("click", () => {

        showNotification(
            "Sıralama özelliği henüz geliştirme aşamasında.",
            "info"
        );
    });

    closeSettingsBtn.addEventListener("click", toggleSettingsPanel);
    menuAddRecipe.addEventListener("click", () => {
        backToList();
        showEditForm();
        settingsPanel.classList.remove("active");
    });

    clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        filterRecipes("");
        searchInput.focus();
    });

    searchInput.addEventListener("input", (e) => {
        filterRecipes(e.target.value);
    });

    recipeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveRecipe();
    });
    addIngredientBtn.addEventListener("click", () => addIngredientField());
    addStepBtn.addEventListener("click", () => addStepField());

    document
        .getElementById("recipe-image")
        .addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById("recipe-preview").src =
                        event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

    cancelEditBtn.addEventListener("click", backToList);
    backToListBtn.addEventListener("click", backToList);
    editCurrentRecipeBtn.addEventListener("click", () => {
        const recipe = recipes.find((r) => r.id === currentRecipeId);
        if (recipe) showEditForm(recipe);
        recipeDetailView.classList.add("hidden");
    });
    deleteCurrentRecipeBtn.addEventListener("click", () => {
        showConfirmation(
            "Tarifi Sil",
            "Bu tarifi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
            () => deleteRecipe(currentRecipeId)
        );
    });

    resetAllBtn.addEventListener("click", () => {
        showConfirmation(
            "Tüm Tarifleri Sıfırla",
            "Bu işlem tüm tariflerinizi kalıcı olarak silecek. Emin misiniz?",
            resetAllRecipes
        );
    });
    exportDataBtn.addEventListener("click", exportRecipes);
    importDataBtn.addEventListener("click", () => {
        document.getElementById("import-file").click();
    });
    document
        .getElementById("import-file")
        .addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                importRecipes(e.target.files[0]);
            }
        });

    themeSelector.addEventListener("change", () => {
        applyTheme(themeSelector.value);
    });

    window.addEventListener("click", (e) => {
        if (e.target === confirmModal) {
            confirmModal.style.display = "none";
        }
        if (e.target === settingsPanel) {
            settingsPanel.classList.remove("active");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (!recipesView.classList.contains("hidden")) {
                if (!searchContainer.classList.contains("hidden")) {
                    searchContainer.classList.add("hidden");
                    searchInput.value = "";
                    filterRecipes("");
                }
            } else {
                backToList();
            }
        }

        if (
            e.ctrlKey &&
            e.key === "Enter" &&
            !editRecipeView.classList.contains("hidden")
        ) {
            saveRecipe();
        }
    });
}

function getSortMethodName(method) {
    switch (method) {
        case "name-asc":
            return "isme göre (A-Z)";
        case "name-desc":
            return "isme göre (Z-A)";
        case "date-new":
            return "tarihe göre (yeniden eskiye)";
        case "date-old":
            return "tarihe göre (eskiden yeniye)";
        default:
            return "";
    }
}

function showConfirmation(title, message, callback) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmModal.style.display = "block";

    const handleConfirm = () => {
        callback();
        confirmModal.style.display = "none";
        confirmOk.removeEventListener("click", handleConfirm);
        confirmCancel.removeEventListener("click", handleCancel);
    };

    const handleCancel = () => {
        confirmModal.style.display = "none";
        confirmOk.removeEventListener("click", handleConfirm);
        confirmCancel.removeEventListener("click", handleCancel);
    };

    confirmOk.addEventListener("click", handleConfirm);
    confirmCancel.addEventListener("click", handleCancel);
}
