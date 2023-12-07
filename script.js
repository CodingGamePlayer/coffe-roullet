document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("roulette");
  const ctx = canvas.getContext("2d");
  const spinButton = document.querySelector("#spin");
  // const participantInput = document.getElementById("participant-name");
  // const participantWeightInput = document.getElementById("participant-weight");
  // const addParticipantButton = document.getElementById("add-participant");
  // const resetButton = document.querySelector("#reset");
  const selectorAllButton = document.querySelector("#select-all");
  const targetModal = document.querySelector("#target-modal");

  const pastelColors = [
    "#FFD1DC", // 분홍색 (Pastel Pink)
    "#E3D7FD", // 연한 라일락색 (Light Lilac)
    "#FFD8B1", // 살구색 (Apricot)
    "#B0E57C", // 연한 민트색 (Light Mint)
    "#DCB4E6", // 연한 라벤더색 (Light Lavender)
    "#AEEEEE", // 연한 터콰이즈색 (Light Turquoise)
    "#FFFFE0", // 연한 노란색 (Light Yellow)
    "#ADD8E6", // 연한 파란색 (Light Blue)
    "#FFDAB9", // 연한 오렌지색 (Light Orange)
    "#D3FFCE", // 연한 연두색 (Light Lime)
    "#BDFCC9", // 연한 라임색 (Light Lime Green)
    "#C9A0DC", // 연한 퍼플색 (Light Purple)
    "#E0FFFF", // 연한 푸른색 (Light Cyan)
    "#F08080", // 연한 코랄색 (Light Coral)
    "#FFD700", // 연한 샤베트색 (Light Sherbet)
    "#F5F5DC", // 연한 베이지색 (Light Beige)
  ];

  let roulettes = [];
  let participants = [];
  let colors = [];
  let angle = 0;
  let spinSpeed = 100; // 회전 속도 변수
  let isSpinning = false;
  let isStopping = false; // 스핀 멈추기 시작했는지 표시하는 변수
  let animationFrameId;
  let selectedColors = [];
  let isSelectorAllClicked = false;

  const tech_7_member = [
    "공영균",
    "김일진",
    "김인경",
    "김상훈",
    "김종식",
    "김동환",
    "우창욱",
  ];

  const tech_7_member_profileImg = [
    true,
    true,
    false,
    false,
    true,
    false,
    true,
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

      // while (selectedColors[getColorIdx] !== 1) {}
      const getColorIdx = Math.floor(Math.random()) * 16;

      if (selectedColors[getColorIdx] === 1) {
      }
      selectedColors[getColorIdx] = 1;
      const randomColor = pastelColors[Math.floor(Math.random() * 16)];
      colors.push(randomColor);
    }

    participants.push({ name, weight, color: colors[colors.length - 1] });

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
    if (participants.length === 0) {
      return;
    }

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

  const spinRoulette = () => {
    angle += spinSpeed; // 회전 각도 증가
    if (isStopping) {
      spinButton.disabled = true;
      spinSpeed *= Math.random() * (0.975 - 0.97) + 0.97;

      if (spinSpeed <= 0.001) {
        console.log("finished");

        const winner = getWinner(); // 당첨자 결정
        displayWinner(winner); // 당첨자 표시

        spinButton.disabled = false;
        isSpinning = false;
        isStopping = true;
        spinSpeed = 0;
        return;
      }
      // resetButton.style.display = "flex";
    }
    updateRoulette();
    requestAnimationFrame(spinRoulette);
  };

  spinButton.addEventListener("click", () => {
    if (participants.length === 0) {
      alert("참여자가 없습니다!");
      return;
    }

    if (!isSpinning) {
      isSpinning = true;
      isStopping = false;
      spinSpeed = 100;

      spinButton.classList.toggle("btn-danger");
      spinButton.querySelector("span").textContent = "Stop";
      requestAnimationFrame(spinRoulette);
    } else {
      isStopping = true; // 스핀 멈추기 시작
      isSpinning = false;
      spinButton.classList.toggle("btn-danger");
      spinButton.querySelector("span").innerText = "Spin";
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

  // document.querySelector("#reset").addEventListener("click", () => {
  //   location.reload();
  // });

  const tech_7_member_DOM = document.querySelector(".tech7-users");

  tech_7_member.forEach((name, idx) => {
    const userBtn = `
        <tr>
          <th scope="row"><input type="checkbox" id="${name}" class="tech7" /></th>
          <td>
            <label for="${name}">
              <img src="./imgs/${
                tech_7_member_profileImg[idx] ? name : "default-user"
              }.png" width="20px" height="20px"/>
              <span>${name}</span>
            </label>
          </td>
          <td><span class="${name} ratio">1</span></td>
          <td>
            <button class="plus btn btn-primary btn-sm">+</button>
            <button class="minus btn btn-outline-primary btn-sm">-</button>
          </td>
        </tr>
      `;
    tech_7_member_DOM.innerHTML += userBtn;
  });

  // 가중치 더하기
  document.querySelectorAll(".plus").forEach((element) => {
    element.addEventListener("click", (e) => {
      const weight = e.target.closest("td").previousElementSibling;
      const inputElement = e.target.closest("tr").querySelector(".tech7");
      const ratioElement = weight.querySelector(".ratio");

      let currentRatio = parseFloat(ratioElement.innerText, 10);
      currentRatio = Math.min(currentRatio + 0.1, 10).toFixed(1); // 최댓값은 10으로 설정
      ratioElement.innerText = currentRatio.toString();

      removeParticipant(inputElement.id);
      inputElement.checked = false;
    });
  });

  document.querySelectorAll(".minus").forEach((element) => {
    element.addEventListener("click", (e) => {
      const weight = e.target.closest("td").previousElementSibling;
      const inputElement = e.target.closest("tr").querySelector(".tech7");
      const ratioElement = weight.querySelector(".ratio");

      let currentRatio = parseFloat(ratioElement.innerText, 10);
      currentRatio = Math.max(currentRatio - 0.1, 1).toFixed(1); // 최소값은 1으로 설정
      ratioElement.innerText = currentRatio.toString();

      removeParticipant(inputElement.id);
      inputElement.checked = false;
    });
  });

  tech_7_member.forEach((member) => {
    const memberDOM = document.querySelector(`#${member}`);

    memberDOM.addEventListener("click", (e) => {
      const memberRatioDOM = document.querySelector(`.${member}.ratio`);
      console.log(memberRatioDOM);

      // 체크되어 있는 멤버면 추가
      e.target.checked
        ? addParticipant(e.target.id, parseFloat(memberRatioDOM.innerText))
        : removeParticipant(e.target.id);
    });
  });

  const getWinner = () => {
    const adjustedAngle =
      (2 * Math.PI - (angle % (2 * Math.PI))) % (2 * Math.PI); // 각도를 0에서 2π 사이 값으로 조정
    let cumulativeAngle = 0;
    const totalWeight = participants.reduce((acc, p) => acc + p.weight, 0);

    // 각 참여자에 대해
    for (const participant of participants) {
      const sliceAngle = (participant.weight / totalWeight) * 2 * Math.PI;
      cumulativeAngle += sliceAngle;
      if (adjustedAngle <= cumulativeAngle) {
        return participant.name; // 당첨된 참여자 반환
      }
    }
  };

  const displayWinner = (winnerName) => {
    // 당첨된 유저를 표시하는 코드 (예: 알림, DOM 요소 변경 등)
    // window.alert(`당첨자: ${winnerName}`);
    const winnerHtml = document.querySelector(".target-modal-body");
    winnerHtml.innerHTML = "";
    winnerHtml.innerHTML = `
      <img src="./imgs/congratulation.png" class="target-modal-body-background"/>
      <div class="target-modal-body-text font-weight-bold text-center">${winnerName}님! <br/> 커피 감사합니다! ☕</div>
    `;

    targetModal.click();
  };

  // 전체 선택 버튼 클릭
  selectorAllButton.addEventListener("click", () => {
    const tech7AllMemberDOM = document.querySelectorAll(".tech7");

    isSelectorAllClicked = !isSelectorAllClicked;

    if (isSelectorAllClicked) {
      tech7AllMemberDOM.forEach((input) => {
        input.checked = true;

        const member = input.id;

        const memberRatioDOM = document.querySelector(
          `.${member}.ratio`
        ).innerText;
        addParticipant(member, parseFloat(memberRatioDOM));
      });
    } else {
      tech7AllMemberDOM.forEach((input) => {
        input.checked = false;

        const member = input.id;
        removeParticipant(member);
      });
    }
  });

  const initRoulette = () => {
    const tech7AllMemberDOM = document.querySelectorAll(".tech7");
    tech7AllMemberDOM.forEach((input) => {
      input.checked = true;

      const member = input.id;

      const memberRatioDOM = document.querySelector(
        `.${member}.ratio`
      ).innerText;
      addParticipant(member, parseFloat(memberRatioDOM));
    });
  };

  initRoulette();
});
