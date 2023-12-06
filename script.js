document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("roulette");
  const ctx = canvas.getContext("2d");
  const spinButton = document.getElementById("spin");
  // const participantInput = document.getElementById("participant-name");
  // const participantWeightInput = document.getElementById("participant-weight");
  // const addParticipantButton = document.getElementById("add-participant");
  const resetButton = document.querySelector("#reset");

  let roulettes = [];
  let participants = [];
  let colors = [];
  let angle = 0;
  let spinSpeed = 1000; // 회전 속도 변수
  let isSpinning = false;
  let isStopping = false; // 스핀 멈추기 시작했는지 표시하는 변수
  let animationFrameId;

  const tech_7_member = [
    "공영균",
    "김일진",
    "김인경",
    "김상훈",
    "김종식",
    "김동환",
    "우창욱",
  ];

  const addParticipant = (name, weight) => {
    if (
      name.trim() === "" ||
      weight <= 0 ||
      participants.some((p) => p.name === name)
    ) {
      return;
    }

    const existingParticipant = participants.find((p) => p.name === name);

    if (existingParticipant) {
      // If the participant already exists, use their existing color
      colors.push(existingParticipant.color);
    } else {
      // If it's a new participant, assign a random color
      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);
      colors.push(randomColor);
    }

    participants.push({ name, weight, color: colors[colors.length - 1] });

    console.log(participants);
    drawRoulette(name);
  };

  // addParticipantButton.addEventListener("click", () => {
  //   addParticipant(
  //     participantInput.value,
  //     parseFloat(participantWeightInput.value)
  //   );
  //   participantInput.value = "";
  //   participantWeightInput.value = "";
  // });

  const removeParticipant = (name) => {
    const index = participants.findIndex((p) => p.name === name);

    if (index !== -1) {
      const removedParticipant = participants.splice(index, 1)[0];
      const removedColor = removedParticipant.color;

      const res = roulettes.find((roulette) => roulette.name === name);
      if (res) {
        const ctxIndex = roulettes.indexOf(res);
        roulettes.splice(ctxIndex, 1);
        res.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw the roulette without the removed participant
        drawRoulette();
      }

      // Reuse the removed color for future participants
      colors.push(removedColor);
    }
  };

  const drawRoulette = (name) => {
    if (participants.length === 0) return;

    const totalWeight = participants.reduce((acc, p) => acc + p.weight, 0);
    let startAngle = 0;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    participants.forEach((participant, index) => {
      const sliceAngle = (participant.weight / totalWeight) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const textAngle = startAngle + sliceAngle / 2; // 참여자 이름을 그릴 각도

      // 섹션 그리기
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        startAngle,
        endAngle
      );
      ctx.fillStyle = colors[index];
      ctx.fill();

      // 참여자 이름 그리기
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(textAngle);
      ctx.textAlign = "right";
      ctx.fillStyle = "#000000"; // 텍스트 색상
      ctx.font = "14px Arial"; // 텍스트 폰트
      ctx.fillText(participant.name, canvas.width / 2 - 10, 0); // 텍스트 위치 조정
      ctx.restore();

      startAngle = endAngle;
    });
    roulettes.push({ ctx, name });

    return ctx;
  };

  const updateRoulette = () => {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawRoulette();
    ctx.restore();
  };

  const getCurrentRouletteSection = (currentAngle) => {
    // 참여자의 weight 합을 구함
    const totalWeight = participants.reduce((acc, p) => acc + p.weight, 0);
    console.log("totalWeight: ", totalWeight);

    // 현재 각도를 0에서 2π 사이로 변환
    currentAngle =
      ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let startAngle = Math.PI / 2;
    console.log(currentAngle);

    for (let i = participants.length - 1; i >= 0; i--) {
      // 각 참여자의 weight 비율을 이용하여 섹션의 크기를 동적으로 조정
      const sectionAngle = (2 * Math.PI * participants[i].weight) / totalWeight;
      const endAngle = startAngle + sectionAngle;

      // 현재 각도가 현재 섹션에 속하는지 확인
      if (currentAngle >= startAngle && currentAngle < endAngle) {
        console.log(currentAngle, startAngle, endAngle);
        console.log(participants[i]);
        console.log(participants);
        return i; // 섹션 인덱스 반환
      }

      startAngle = endAngle;
    }

    if (currentAngle >= startAngle || currentAngle < Math.PI / 2) {
      console.log(currentAngle, startAngle, Math.PI / 2);
      console.log(participants[0]);
      console.log(participants);
      return 0; // 첫 번째 섹션 인덱스 반환
    }

    return null; // 섹션을 찾지 못한 경우
  };

  const spinRoulette = () => {
    if (isStopping && spinSpeed <= 0) {
      isStopping = false;
      isSpinning = false; // 스핀을 다시 시작할 수 있도록 상태 변경
      spinButton.textContent = "Spin";
    }

    angle += spinSpeed; // 현재 속도로 회전

    // 멈추기 시작했을 때만 속도 감소
    if (isStopping) {
      spinButton.disabled = true;
      spinSpeed *= Math.random() * (0.98 - 0.975) + 0.975; // 0.98에서 0.975 사이의 랜덤 감소 속도

      console.log(getCurrentRouletteSection(angle));
      if (spinSpeed <= 0.001) {
        console.log("finished");
        const currentSection = getCurrentRouletteSection(angle);

        if (currentSection !== null) {
          const winnerName = participants[currentSection].name;
          alert(`Winner: ${winnerName}`);
        } else {
          alert("No winner found"); // 예외 처리: 섹션을 찾을 수 없을 경우
        }

        spinButton.disabled = false;
        isSpinning = false;
        isStopping = true;
        spinSpeed = 0;
        return;
      }
      resetButton.style.display = "flex";
    }

    updateRoulette();
    animationFrameId = requestAnimationFrame(spinRoulette);
  };

  spinButton.addEventListener("click", () => {
    if (!isSpinning) {
      isSpinning = true;
      isStopping = false;
      spinSpeed = 1000; // 현재 속도로 초기화 또는 적절한 값으로 설정

      spinButton.textContent = "Stop";
      requestAnimationFrame(spinRoulette);
    } else {
      isStopping = true; // 스핀 멈추기 시작
      isSpinning = false;
      spinButton.textContent = "Spin";
    }
  });
  // 엔터키 이벤트 추가
  // participantInput.addEventListener("keypress", (e) => {
  //   if (e.key === "Enter") {
  //     addParticipant(
  //       participantInput.value,
  //       parseFloat(participantWeightInput.value)
  //     );
  //     participantInput.value = "";
  //     participantWeightInput.value = "";
  //   }
  // });

  // participantWeightInput.addEventListener("keypress", (e) => {
  //   if (e.key === "Enter") {
  //     addParticipant(
  //       participantInput.value,
  //       parseFloat(participantWeightInput.value)
  //     );
  //     participantInput.value = "";
  //     participantWeightInput.value = "";
  //   }
  // });
  drawRoulette();

  document.querySelector("#reset").addEventListener("click", () => {
    location.reload();
  });

  const tech_7_member_DOM = document.querySelector(".tech7-users");

  tech_7_member.forEach((name) => {
    const userBtn = `
        <div>
          <input type="checkbox" id="${name}" />
          <label for="${name}">
            <span>${name}</span>
            <span class="${name} ratio">1</span>
          </label>
          <button class="plus btn btn-primary btn-sm">+</button>
          <button class="minus btn btn-outline-primary btn-sm">-</button>
        </div>
      `;
    tech_7_member_DOM.innerHTML += userBtn;
  });

  document.querySelectorAll(".plus").forEach((element) => {
    element.addEventListener("click", (e) => {
      const label = e.target.closest("div").querySelector("label");
      const inputElement = label.previousElementSibling;
      const ratioElement = label.querySelector(".ratio");

      let currentRatio = parseInt(ratioElement.innerText, 10);
      currentRatio = Math.min(currentRatio + 1, 10); // 최댓값은 10으로 설정
      ratioElement.innerText = currentRatio.toString();

      removeParticipant(label.htmlFor);
      inputElement.checked = false;
    });
  });

  document.querySelectorAll(".minus").forEach((element) => {
    element.addEventListener("click", (e) => {
      const label = e.target.closest("div").querySelector("label");
      const inputElement = label.previousElementSibling;
      const ratioElement = label.querySelector(".ratio");

      let currentRatio = parseInt(ratioElement.innerText, 10);
      currentRatio = Math.max(currentRatio - 1, 1); // 최소값은 1으로 설정
      ratioElement.innerText = currentRatio.toString();

      removeParticipant(label.htmlFor);
      inputElement.checked = false;
    });
  });

  tech_7_member.forEach((member) => {
    const memberDOM = document.querySelector(`#${member}`);

    memberDOM.addEventListener("click", (e) => {
      const memberRatioDOM = document.querySelector(`.${member}.ratio`);

      e.target.checked
        ? addParticipant(e.target.id, parseFloat(memberRatioDOM.innerText))
        : removeParticipant(e.target.id);
    });
  });
});
