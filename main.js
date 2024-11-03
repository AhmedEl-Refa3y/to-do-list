function getCurrentDateTime(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// الدالة الرئيسية لبدء إدارة المهام
function startTaskManager() {
  // الحصول على عناصر الشاشة
  //var nameScreen = document.getElementById("name-screen");
  var taskScreen = document.getElementById("task-screen");
  var userNameInput = document.getElementById("userName");
  var userGreeting = document.getElementById("userGreeting");

  // التحقق من إدخال اسم المستخدم
  if (userNameInput.value.trim() !== "") {
    // إخفاء شاشة الاسم وعرض شاشة المهام
    nameScreen.style.display = "none";
    taskScreen.style.display = "block";

    var currentDate = new Date();
    var expirationDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    userGreeting.innerHTML =
      "مرحبًا، " +
      userNameInput.value +
      "! الوقت المحدد لإنهاء المهام: " +
      getCurrentDateTime(expirationDate);

    // عرض التحية للمستخدم
    userGreeting.innerHTML = "مرحبًا، " + userNameInput.value + "!";

    // Show the history section
    document.getElementById("history").style.display = "block";
  }
  return false;
}

// دالة لإضافة مهمة جديدة
function addTask() {
  // الحصول على عناصر إدخال المهمة وقائمة المهام
  var taskInput = document.getElementById("taskInput");
  var deadlineInput = document.getElementById("deadlineInput");
  var taskList = document.getElementById("taskList");

  // التحقق من إدخال المهمة
  if (taskInput.value.trim() !== "") {
    // إعداد تاريخ انتهاء المهمة (بعد 24 ساعة)
    var currentDate = new Date();
    var expirationDate = deadlineInput.value
      ? new Date(deadlineInput.value)
      : new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    // استرجاع اسم المستخدم وصورة المستخدم (يمكن إضافة المزيد من المتغيرات إلى الكائن إذا لزم الأمر)
    var userNameInput = document.getElementById("userName");

    // إعداد كائن المهمة
    var task = {
      text: taskInput.value,
      expiration: expirationDate,
      deadline: expirationDate, // Add the deadline property
      addedAt: currentDate, // تاريخ الإضافة
    };

    // استرجاع المهام المحفوظة من التخزين المحلي
    var tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // إضافة المهمة الجديدة إلى القائمة وحفظها في التخزين المحلي
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // إنشاء عنصر li لعرض المهمة
    var li = document.createElement("li");

    /*****************/
    // إنشاء عنصر span لوضع النص داخله
    var taskTextSpan = document.createElement("span");
    taskTextSpan.textContent = taskInput.value;
    taskTextSpan.classList.add("TASK");

    // إعداد الأزرار والوقت
    var taskActions = document.createElement("span");
    taskActions.className = "task-actions";
    taskActions.innerHTML =
      '<button onclick="removeTask(this)">حذف</button><button onclick="completeTask(this)">تم الانتهاء</button>';

    var taskTimeSpan = document.createElement("span");
    taskTimeSpan.className = "task-time";
    taskTimeSpan.textContent =
      "Added: " +
      getCurrentDateTime(task.addedAt) +
      " - Deadline: " +
      getCurrentDateTime(task.deadline);

    var taskCountdownSpan = document.createElement("span");
    taskCountdownSpan.className = "task-countdown";
    li.appendChild(taskTextSpan);
    li.appendChild(taskCountdownSpan);

    // إضافة النص المهمة إلى معرف العنصر li (يمكن استخدام data-*)
    li.dataset.taskText = taskInput.value;

    // إضافة العناصر إلى عنصر li
    li.appendChild(taskTimeSpan);
    li.appendChild(taskActions);

    // إضافة عنصر li إلى قائمة المهام وتفريغ حقل إدخال المهمة
    taskList.appendChild(li);
    taskInput.value = "";
    /********************/ deadlineInput.value = "";

    // التحقق من وجود مهام لتحديث رؤية الرسالة
    updateNoTasksMessage();

    var countdownInterval = setInterval(function () {
      var remainingTime = task.deadline - new Date();

      if (remainingTime > 0) {
        var remainingDays = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        var remainingHours = Math.floor(
          (remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
        );
        var remainingMinutes = Math.floor(
          (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
        );
        var remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        taskCountdownSpan.textContent =
          "Deadline in: " +
          remainingDays +
          "d " +
          remainingHours +
          "h " +
          remainingMinutes +
          "m " +
          remainingSeconds +
          "s";
      } else {
        taskCountdownSpan.textContent = "Deadline passed!";
        clearInterval(countdownInterval);

        // قم بإزالة المهمة من قائمة المهام وحفظ التغييرات في التخزين المحلي
        var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks = tasks.filter((t) => t.text !== task.text);
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // إضافة المهمة المنتهية إلى السجل
        addToHistory(task.text, "expired", "expired");

        // إزالة العنصر li من قائمة المهام
        li.remove();

        // التحقق من وجود مهام لتحديث رؤية الرسالة
        updateNoTasksMessage();
      }
    }, 1000);
  }
}

// دالة لتحديث رؤية الرسالة عند تغيير حالة المهام
function updateNoTasksMessage() {
  var noTasksMessage = document.getElementById("noTasksMessage");
  var taskList = document.getElementById("taskList");

  // عرض الرسالة إذا لم تكن هناك مهام
  noTasksMessage.style.display =
    taskList.children.length === 0 ? "block" : "none";
}

// دالة لحذف مهمة
function removeTask(element) {
  var li = element.closest("li");
  var taskText = li.dataset.taskText;

  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // فلترة المهمة المحذوفة وحفظ التغييرات في التخزين المحلي
  tasks = tasks.filter((task) => task.text !== taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // إزالة العنصر li من قائمة المهام
  li.remove();

  // التحقق من وجود مهام لتحديث رؤية الرسالة
  updateNoTasksMessage();

  // Add task deletion to history
  addToHistory(taskText, "deleted");
}

// دالة لإكمال مهمة
function completeTask(element) {
  var li = element.closest("li"); // الحصول على العنصر li الذي يحتوي على الزر الذي تم النقر عليه
  // تنسيق المهمة المكتملة
  li.style.textDecoration = "line-through";
  element.style.display = "none";

  // إزالة العنصر li من قائمة المهام
  li.remove();

  // التحقق من وجود مهام لتحديث رؤية الرسالة
  updateNoTasksMessage();

  // Add task completion to history
  addToHistory(li.dataset.taskText, "completed");

  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addToHistory(taskText, action, status) {
  var historyList = document.getElementById("historyList");
  var historyItem = document.createElement("li");

  var actionText;
  if (action === "completed") {
    actionText = "Completed";
  } else if (action === "deleted" && status !== "expired") {
    actionText = "Deleted";
  } else {
    actionText = "Deadline Passed";
  }
  var currentDate = new Date();
  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  var formattedDate = currentDate.toLocaleDateString("en-US", options);

  historyItem.textContent =
    actionText + ": " + taskText + " on " + formattedDate;

  historyList.appendChild(historyItem);

  var deleteButton = document.createElement("button");
  deleteButton.textContent = "حذف";
  deleteButton.onclick = function () {
    removeFromHistory(historyItem, taskText);
  };
  historyItem.appendChild(deleteButton);

  historyList.appendChild(historyItem);
}

function removeFromHistory(historyItem, taskText) {
  var confirmation = confirm("هل أنت متأكد أنك تريد حذف هذا السجل؟");

  if (confirmation) {
    // Remove the history item from the DOM
    historyItem.remove();

    // You can add logic here to update the backend or localStorage if needed
  }
}
