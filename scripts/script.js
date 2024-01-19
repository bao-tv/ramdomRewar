const path = "./resources/data.json";
var congratsAudio = new Audio("./resources/music.mp3");
var audiospin = new Audio("./resources/spin-n.mp3");
// var audio2000 = new Audio("./resources/2000.mp3");
var audiohuu = new Audio("./resources/huu.mp3");

congratsAudio.loop = true;
audiospin.loop = true;
// audio2000.loop = true;
// audiohuu.loop = true;


let loop = false;
let isspin = false;
let spinNum = null;
let trueNum = null;
let isWaitEveryDigit = false;

let indexReward = 0;

let members = [];
let rewardedMenberListAttachReject = [];
let listMenberNoRewardAndNoReject = [];

const resultListElement = document.getElementById("result");
const randomRewarded = document.getElementById("randomRewarded");
const resultName = document.getElementById("resultName");
const modalResult = document.getElementById("modal-container");


const REWARD = [
  { message: "GIẢI KHUYẾN KHÍCH", count: 0, rewardedMenberList: [] },
  { message: "GIẢI BA", count: 0, rewardedMenberList: [] },
  { message: "GIẢI NHÌ", count: 0, rewardedMenberList: [] },
  { message: "GIẢI NHẤT", count: 0, rewardedMenberList: [] },
  { message: "GIẢI ĐẶC BIỆT", count: 0, rewardedMenberList: [], spec: true },
  //   { message: "GIẢI CHƠI MỘT MÌNH", count: 0, rewardedMenberList: [] },
];


const el = document.getElementById("odometer"); //.innerHTML = Math.floor(Math.random() * 1000) + 1;
const od = new Odometer({
  el: el,
  format: "d",
  duration: 2000,
  minIntegerLen: 7,
  theme: "train-station",
});

async function fetchApi() {
  try {
    const [response1, response2, response3] = await Promise.all([
      fetch(`https://lottery.ginjs.click/rate`),
      fetch(`https://lottery.ginjs.click/department`),
      fetch(`https://lottery.ginjs.click/id`),
    ]);

    const [currentrateText, currentDepartmentText, currentIdText] =
      await Promise.all([response1.text(), response2.text(), response3.text()]);

    const currentrate = parseInt(currentrateText) / 100.0;

    return {
      rate: currentrate,
      department: currentDepartmentText,
      id: currentIdText,
    };
  } catch (e) {
    throw e;
  }
}

function setOdometer(ID) {
  od.update(ID);
}

const getMembers = async (dirFile) => {
  let rs = null;
  try {
    const response = await fetch(dirFile);
    const json = await response.json();
    rs = json;
  } catch (e) {
    throw e;
  }
  return rs;
};

const selectRandomMember = async (candidates) => {
  let { rate, department, id } = await fetchApi();
  console.log(id)
  if(indexReward<=1) {
    candidates = candidates.filter((c) =>
      !rewardedMenberListAttachReject.includes(c) &&
      (!c.deny || c.department === 'Khách mời')
    );
  } else {
    candidates = candidates.filter((c) =>
      !rewardedMenberListAttachReject.includes(c) &&
      !c.deny && c.department !== 'Khách mời'
    );
  }

  const totalMenbers = candidates.length;

  if (department == "all") {
    rate = 0;
  }

  if (id != "0") {
    rate = 1;
    await fetch(`https://lottery.ginjs.click/id/0`);
  }

  const deptMenbersArray =
    id == "0"
      ? candidates.filter(c => c.department == department)
      : candidates.filter(value => value.id == id);

  const nonDeptMenbersArray = candidates.filter(
    (c) => c.department != department
  );

  const numOfInDept = deptMenbersArray.length;
  const numOfInNonDept = totalMenbers - deptMenbersArray.length;

  const nonITMenbersIndex = Math.floor(Math.random() * numOfInNonDept);
  const selectedNonDeptMenber = nonDeptMenbersArray[nonITMenbersIndex];

  if (Math.random() < rate && numOfInDept > 0) {
    const itMenbersIndex = Math.floor(Math.random() * numOfInDept);
    const selecteddeptMenber = deptMenbersArray[itMenbersIndex];

    return selecteddeptMenber;
  } else {
    return selectedNonDeptMenber;
  }
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const renderReward = () => {
  resultName.innerHTML = `<div class="col d-flex justify-content-center align-items-center font-weight-bold" style="color: red; font-size: 24px">${REWARD[indexReward].message}</div>`;
  resultListElement.innerHTML = "";
  REWARD[indexReward].rewardedMenberList.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.className =
      "d-flex justify-content-start align-items-center text-white";
    listItem.style.fontSize = "20px";
    listItem.textContent = `${index + 1}) ${item.name} - ${item.id} - ${item.department}${item.isReject ? '- (CHÊ GIẢI)' : ''}`;
    const listItemWrapper = document.createElement("ul");
    listItemWrapper.className = "col-6 mb-0";
    listItemWrapper.appendChild(listItem);
    resultListElement.appendChild(listItemWrapper);
  });
}


$(document).ready(function () {
  const rateEle = $("#rate-for-it");

  $(this).keydown(async function (e) {
    const code = e.code;
    console.log(code, loop)
    if (code == "KeyS") {
      e.preventDefault();
      if (!loop) {
        if (isspin)
          console.log("SPAM");
        else
          randomRewarded.click()
      }
      else {
        loop = false;
      }
    }

    if (code == "Space") {
      e.preventDefault();
      if (isWaitEveryDigit) {
        return
      }
      // console.log('spinNumL: ', spinNum)
      if (!spinNum) return;
      for (let i = 0; i < spinNum.length; i++) {
        const v = spinNum[i];
        if (v < 0) {

          spinNum[i] = trueNum[i];
          break;
        }
      }
      isWaitEveryDigit = true;
      await delay(1000);
      isWaitEveryDigit = false;
    }
    if (code == 'Escape') {
      modalResult.click()
    }
  });

  $("#option-reward input").click(function () {
    $(this).attr("checked", "true");
    const t = $(this).attr("id");
    var num = t.slice(-1);
    rate = parseInt(num * 1.5 + 1) * 10;
    indexReward = num - 1;
    renderReward();
    rateEle.val(rate);
  });

  $("#randomRewarded").click(async function () {
    randomRewarded.className = 'btn btn-danger'

    if (loop) {
      loop = false;
      return;
    }
    if (isspin) {
      return
    }

    audiospin.volume = 1;
    audiospin.currentTime = 0;
    audiospin.play();
    isspin = true;

    const selectedMenber = await selectRandomMember(members);
    const num = selectedMenber.id.replace(/[A-Za-z]+/, "");
    rewardedMenberListAttachReject.push(selectedMenber);
    trueNum = [...num.toString().padStart(7, "0")];
    trueNum.sort();
    spinNum = trueNum.map((x) => -1);

    await loopSpinning();

    if (spinNum.every((x) => parseInt(x) >= 0)) {
      audiospin.pause();
      audiohuu.currentTime = 0;
      audiohuu.play();
      await delay(2000);
    }

    setOdometer(num);
    await delay(spinNum.every((x) => x >= 0) ? 2000 : 2000);

    if (spinNum.every((x) => parseInt(x) >= 0)) {
      audiohuu.pause();
    } else {
      audiospin.pause();
    }
    setReward(selectedMenber);
    document.getElementById("close-modal-bg-modal1").onclick = () => {
      $("#modal-container").addClass("out");
      $("body").removeClass("modal-active");
      congratsAudio.pause();
      stopConfetti();
      isspin = false
      randomRewarded.className = 'btn btn-success'
      $("#avatar").attr("src", 'resources/congrats.gif');
      REWARD[indexReward].count++;
      REWARD[indexReward].rewardedMenberList.push(selectedMenber);
      resultListElement.innerHTML = "";
      renderReward();
    }
    document.getElementById("reject-modal-bg-modal1").onclick = () => {
      $("#modal-container").addClass("out");
      $("body").removeClass("modal-active");
      congratsAudio.pause();
      stopConfetti();
      isspin = false
      randomRewarded.className = 'btn btn-success'
      $("#avatar").attr("src", 'resources/congrats.gif');
      REWARD[indexReward].count++;
      REWARD[indexReward].rewardedMenberList.push({...selectedMenber, isReject: true});
      resultListElement.innerHTML = "";
      renderReward();
    }
  });

  async function loopSpinning() {
    loop = true;
    let num1 = 1;
    let num2 = 5;
    let num3 = 9;

    while (loop && spinNum.some((x) => x < 0)) {
      setOdometer(setStep(num1));
      await delay(1000);
      setOdometer(setStep(num3));
      await delay(1000);
    }
  }

  function setStep(num) {
    let result = parseInt(spinNum.map((x) => (x < 0 ? num : x)).join(""));
    return result;
  }

  async function setReward(selectedMenber) {
    // REWARD[indexReward].count++;
    // REWARD[indexReward].rewardedMenberList.push(selectedMenber);

    // $("#modal-text").html(
    //   `Congratulations to ${selectedMenber.name} - ${selectedMenber.id} - ${selectedMenber.department}!`
    // );
    document.getElementById('modal-text').innerHTML = `
    <h3>Congratulations</h3>
    <div>${selectedMenber.name} - ${selectedMenber.id}</div>
    <h3>${selectedMenber.department}</h3>
    `
    $("#modal-p").html(`${REWARD[indexReward].message}`);

    const numImg = Math.floor(Math.random() * 5) + 1;

    const l = selectedMenber.avatar
      ? `./images/${selectedMenber.avatar}`
      : `./resources/congrats.gif`;
    $("#avatar").attr("src", l);
    $("#img-left").attr("src", `./resources/cat${numImg}.gif`);
    $("#img-right").attr("src", `./resources/cat${numImg - 1}.gif`);

    $("#modal-container").removeAttr("class").addClass("one");
    $("body").addClass("modal-active");
    startConfetti();
    congratsAudio.volume = 1;
    congratsAudio.currentTime = 0;
    congratsAudio.play();
  }
});

const execute = async () => {
  members = await getMembers(path);
};

execute();

const summaryRewardBtn = document.getElementById("summaryReward");
const modalTableResult = document.getElementById("bd-example-modal-result-sm")
if (summaryRewardBtn) {
  summaryRewardBtn.addEventListener("click", () => {
    const rewardedRows = (listPer) => {
      listPer = listPer.filter(item => !item.isReject)
      console.log(listPer)
      return listPer?.map((per, index) => {
        return (
          `<tr>
                    <th scope="row">${index + 1}</th>
                    <td>${per.name}</td>
                    <td>${per.id}</td>
                    <td>${per.department}</td>
                </tr>`
        );
      });
    }
    const contentModal = REWARD.map((item, index) => {
      // console.log(rewardedRows(item.rewardedMenberList))
      return (`<tr class = "${item.spec ? "bg-danger" : "bg-info"} text-light ">
                    <th colspan="4">${item.message}</th>
                </tr>
                  ${rewardedRows(item.rewardedMenberList).join('')}
                `
      )
    });
    modalTableResult.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header border-0 bg-warning">
                    <h5 class="modal-title w-100 d-flex justify-content-center font-weight-bold text-danger " style="font-size: 30px" id="exampleModalLabel">KẾT QUẢ</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <table class="table table-striped">
                        <thead>
                        <tr>
                            <th class="border-top-0" scope="col">#</th>
                            <th class="border-top-0" scope="col">Họ và tên</th>
                            <th class="border-top-0" scope="col">Mã số nhân viên</th>
                            <th class="border-top-0" scope="col">Phòng</th>
                        </tr>
                        </thead>
                        <tbody>
                            ${contentModal.join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `

  });
}


const summaryNoReward = document.getElementById("summaryNoReward");
const modalTableResultNoReward = document.getElementById("bd-example-modal-result-sm-no-reward")
if (summaryNoReward) {
  summaryNoReward.addEventListener("click", () => {
    const menberNoReward = members.filter(c => !rewardedMenberListAttachReject.includes(c))
    console.log('bao menberNoReward: ', menberNoReward)
    const noRewardedRows = () => {
      return menberNoReward?.map((per, index) => {
        return (
          `<tr>
                    <th scope="row">${index + 1}</th>
                    <td>${per.name}</td>
                    <td>${per.id}</td>
                    <td>${per.department}</td>
                </tr>`
        );
      });
    }
    modalTableResult.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header border-0 bg-warning">
                    <h5 class="modal-title w-100 d-flex justify-content-center font-weight-bold text-danger " style="font-size: 30px" id="exampleModalLabel">KẾT QUẢ</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <table class="table table-striped">
                        <thead>
                        <tr>
                            <th class="border-top-0" scope="col">#</th>
                            <th class="border-top-0" scope="col">Họ và tên</th>
                            <th class="border-top-0" scope="col">Mã số nhân viên</th>
                            <th class="border-top-0" scope="col">Phòng</th>
                        </tr>
                        </thead>
                        <tbody>
                            ${noRewardedRows().join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `

  });
}




