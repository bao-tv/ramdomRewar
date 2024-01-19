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
let rewardedMenberList = [];


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

  candidates = candidates.filter((c) =>
    !rewardedMenberList.includes(c) &&
    (!c.deny || c.department === 'Khách mời') &&
    (indexReward <= 1 || c.department === 'Khách mời')
  );

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
    listItem.textContent = `${index + 1}) ${item.name} - ${item.id} - ${item.department}`;
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
    // if (code.startsWith("Digit")) {
    //   e.preventDefault();
    //   if (isWaitEveryDigit) {
    //     return
    //   }
    //   const k = parseInt(code.slice(-1));

    //   if (k < 6) {
    //     $(`#option-reward input#option${k}`).trigger("click");
    //   }



    // }
  });

  $("#modal-container").click(function () {
    $(this).addClass("out");
    $("body").removeClass("modal-active");
    congratsAudio.pause();
    stopConfetti();
    isspin = false
    randomRewarded.className = 'btn btn-success'
    $("#avatar").attr("src", 'resources/congrats.gif');

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
    rewardedMenberList.push(selectedMenber);
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
    REWARD[indexReward].count++;
    REWARD[indexReward].rewardedMenberList.push(selectedMenber);
    resultListElement.innerHTML = "";
    renderReward();

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

  //   var t = `image2/5987.jpg image2/9016.jpg image2/40174.jpg image2/40311.jpg image2/40312.jpg image2/40453.jpg image2/40637.jpg image2/40720.jpg image2/40757.jpg image2/41166.jpg image2/41179.jpg image2/41554.jpg image2/42562.jpg image2/42623.jpg image2/42856.jpg image2/43081.jpg image2/43282.jpg image2/43455.jpg image2/43903.jpg image2/44526.jpg image2/44665.jpg image2/44690.jpeg image2/44708.jpg image2/45425.jpg image2/45544.jpg image2/45765.jpg image2/46102.jpg image2/46798.jpg image2/46854.png image2/46995.jpg image2/47060.jpg image2/47886.jpg image2/48795.jpg image2/48796.jpg image2/50487.jpg image2/73657.jpg image2/74162.png image2/77183.jpg image2/77900.jpg image2/80248.jpg image2/80294.jpg image2/81006.jpg image2/81860.jpg image2/81935.jpg image2/82605.jpg image2/83172.jpg image2/83742.jpg image2/83847.jpg image2/85354.jpg image2/86254.jpg image2/89482.jpg image2/91781.jpg image2/92135.jpg image2/92982.jpg image2/93040.jpg image2/96523.jpg image2/98038.jpg image2/104799.png image2/105358.jpg image2/110459.jpg image2/111125.jpeg image2/111127.png image2/114671.jpg image2/114950.jpg image2/117499.jpg image2/117934.jpg image2/117977.jpg image2/118478.png image2/119102.jpg image2/120700.jpg image2/120941.jpg image2/120960.jpg image2/120980.jpg image2/121246.jpg image2/121487.jpg image2/121488.JPEG image2/121897.png image2/122077.jpg image2/122560.jpg image2/8005611.jpg image2/8007981.jpg image2/8008489.jpg image2/8008913.jpg image2/8009259.jpg image2/8010678.jpg image2/8013888.jpg image2/8019035.jpg image2/8019889.jpg image2/8019902.jpg image2/8022825.jpg image2/8023709.png image2/8023775.jpg image2/8023850.jpg image2/8024487.png image2/8024701.jpg image2/TTS021123.jpg image2/VCB01.jpg image2/VCB02.jpg image2/VCB03.jpg image2/VCB04.jpg image2/VCB05.jpg image2/VCB06.jpg image2/VCB07.jpg image2/VCB08.jpg
  // `
  //   members2 = await getMembers('./resources/data2.json')
  //   var tt = t.split(/\s|\n/).map(x => ({ id: x.split(/\/|\./)[1], path: x.replace('image2/','') }))


  //   members2 = members2.map(x => ({ ...x, avatar: members.filter(m=>m.id==x.id)[0]?.Avatar || tt.filter(t => t.id == x.id)[0]?.path }))

  // const members2 = members.filter(x => !x.avatar).map(x=>x.name+' - '+x.id+' - '+x.department)
  // console.log(JSON.stringify(members2))
};

execute();

const summaryButton = document.getElementById("summary");
const modalTableResult = document.getElementById("bd-example-modal-result-sm")
if (summaryButton) {
  summaryButton.addEventListener("click", () => {
    const rewardedRows = (listPer) => listPer.map((per, index) => {
      return (
        `<tr>
                  <th scope="row">${index + 1}</th>
                  <td>${per.name}</td>
                  <td>${per.id}</td>
                  <td>${per.department}</td>
              </tr>`
      );
    });
    const contentModal = REWARD.map((item, index) => {
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



