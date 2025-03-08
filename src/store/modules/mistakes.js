// store/modules/mistakes.js - 間違えた問題を管理するためのVuexストアモジュール

/**
 * 次の日曜日の18時の日時を計算する関数
 * @returns {Date} 次の日曜日の18時のDate
 */
const getNextSundayAt18 = () => {
  const now = new Date();
  const resultDate = new Date(now);
  // 現在の曜日を取得（0: 日曜日, 1: 月曜日, ...)
  const currentDay = now.getDay();
  // 次の日曜日までの日数を計算
  const daysUntilNextSunday = currentDay === 0 ? 7 : 7 - currentDay;
  
  // 現在日に日数を加算
  resultDate.setDate(now.getDate() + daysUntilNextSunday);
  // 時間を18時に設定
  resultDate.setHours(18, 0, 0, 0);
  
  return resultDate;
};

/**
 * 指定された日時までの残り時間を「〇日〇時間〇分」の形式で返す関数
 * @param {Date} targetDate 対象の日時
 * @returns {string} 残り時間の文字列
 */
const getRemainingTimeString = (targetDate) => {
  const now = new Date();
  const diffTime = targetDate - now;
  
  if (diffTime <= 0) {
    return "クリア可能です";
  }
  
  // ミリ秒を日・時間・分に変換
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  // 残り時間の文字列を作成
  let remainingTime = "";
  if (days > 0) {
    remainingTime += `${days}日 `;
  }
  remainingTime += `${hours}時間 ${minutes}分`;
  
  return remainingTime;
};

// 状態（state）の定義
const state = {
  // 間違えた問題のリスト
  mistakesList: [],
  // 最終更新日時
  lastUpdated: null
};

// ミューテーション（mutations）の定義
const mutations = {
  /**
   * 間違えた問題を追加または更新する
   * @param {Object} state ストアの状態
   * @param {Object} payload 間違えた問題のデータ
   */
  addMistake(state, { questionId, subject, topic, question, options, correctAnswer, explanation }) {
    // 既存の間違い記録を検索
    const existingIndex = state.mistakesList.findIndex(item => item.questionId === questionId);
    
    if (existingIndex >= 0) {
      // 既存の記録があれば、間違えた回数をインクリメントし、クリア可能日時を更新
      const mistake = state.mistakesList[existingIndex];
      state.mistakesList[existingIndex] = {
        ...mistake,
        count: mistake.count + 1,
        lastMistaken: new Date().toISOString(),
        clearableAt: getNextSundayAt18().toISOString()
      };
    } else {
      // 新規の記録を追加
      state.mistakesList.push({
        questionId,
        subject,
        topic,
        question,
        options,
        correctAnswer,
        explanation,
        count: 1,
        lastMistaken: new Date().toISOString(),
        clearableAt: getNextSundayAt18().toISOString(),
        isClearable: false
      });
    }
    
    // 最終更新日時を更新
    state.lastUpdated = new Date().toISOString();
  },
  
  /**
   * 間違えた問題をクリア（削除）する
   * @param {Object} state ストアの状態
   * @param {string} questionId 問題ID
   */
  clearMistake(state, questionId) {
    // 問題IDに一致する記録を検索し、クリア可能な場合のみ削除
    const mistakeIndex = state.mistakesList.findIndex(item => 
      item.questionId === questionId && item.isClearable);
    
    if (mistakeIndex >= 0) {
      state.mistakesList.splice(mistakeIndex, 1);
      state.lastUpdated = new Date().toISOString();
    }
  },
  
  /**
   * すべての間違えた問題をクリア（クリア可能なもののみ）
   * @param {Object} state ストアの状態
   */
  clearAllMistakes(state) {
    // クリア可能な問題のみをフィルタリングして残し、それ以外を削除
    state.mistakesList = state.mistakesList.filter(item => !item.isClearable);
    state.lastUpdated = new Date().toISOString();
  },
  
  /**
   * 間違えた問題が正解された場合の処理
   * @param {Object} state ストアの状態
   * @param {string} questionId 問題ID
   */
  markCorrect(state, questionId) {
    // 問題IDに一致する記録を検索
    const mistakeIndex = state.mistakesList.findIndex(item => item.questionId === questionId);
    
    if (mistakeIndex >= 0) {
      // 間違えた回数をデクリメント
      const mistake = state.mistakesList[mistakeIndex];
      if (mistake.count > 1) {
        state.mistakesList[mistakeIndex] = {
          ...mistake,
          count: mistake.count - 1,
          lastMistaken: new Date().toISOString()
        };
      } else {
        // 間違えた回数が1回の場合は記録を削除
        state.mistakesList.splice(mistakeIndex, 1);
      }
      
      state.lastUpdated = new Date().toISOString();
    }
  },
  
  /**
   * クリア可能かどうかの状態を更新
   * @param {Object} state ストアの状態
   */
  updateClearableStatus(state) {
    const now = new Date();
    
    // すべての間違えた問題のクリア可能状態を更新
    state.mistakesList.forEach((mistake, index) => {
      const clearableAt = new Date(mistake.clearableAt);
      state.mistakesList[index].isClearable = now >= clearableAt;
    });
  },
  
  /**
   * ストアの状態をローカルストレージから復元
   * @param {Object} state ストアの状態
   * @param {Object} payload 復元するデータ
   */
  setState(state, { mistakesList, lastUpdated }) {
    state.mistakesList = mistakesList || [];
    state.lastUpdated = lastUpdated || null;
  }
};

// アクション（actions）の定義
const actions = {
  /**
   * 間違えた問題を記録する
   * @param {Object} context ストアのコンテキスト
   * @param {Object} payload 間違えた問題のデータ
   */
  recordMistake({ commit, dispatch }, payload) {
    commit('addMistake', payload);
    dispatch('saveToLocalStorage');
  },
  
  /**
   * 間違えた問題をクリアする
   * @param {Object} context ストアのコンテキスト
   * @param {string} questionId 問題ID
   */
  clearMistake({ commit, dispatch }, questionId) {
    commit('clearMistake', questionId);
    dispatch('saveToLocalStorage');
  },
  
  /**
   * すべての間違えた問題をクリアする
   * @param {Object} context ストアのコンテキスト
   */
  clearAllMistakes({ commit, dispatch }) {
    commit('clearAllMistakes');
    dispatch('saveToLocalStorage');
  },
  
  /**
   * 間違えた問題が正解された場合の処理
   * @param {Object} context ストアのコンテキスト
   * @param {string} questionId 問題ID
   */
  markCorrect({ commit, dispatch }, questionId) {
    commit('markCorrect', questionId);
    dispatch('saveToLocalStorage');
  },
  
  /**
   * ローカルストレージからデータを読み込む
   * @param {Object} context ストアのコンテキスト
   */
  loadFromLocalStorage({ commit }) {
    try {
      const mistakesData = localStorage.getItem('cat-teacher-mistakes');
      if (mistakesData) {
        const parsedData = JSON.parse(mistakesData);
        commit('setState', parsedData);
        // クリア可能状態を即時更新
        commit('updateClearableStatus');
      }
    } catch (error) {
      console.error('間違えた問題データの読み込みに失敗しました', error);
    }
  },
  
  /**
   * ローカルストレージにデータを保存する
   * @param {Object} context ストアのコンテキスト
   */
  saveToLocalStorage({ state }) {
    try {
      const mistakesData = {
        mistakesList: state.mistakesList,
        lastUpdated: state.lastUpdated
      };
      localStorage.setItem('cat-teacher-mistakes', JSON.stringify(mistakesData));
    } catch (error) {
      console.error('間違えた問題データの保存に失敗しました', error);
    }
  }
};

// ゲッター（getters）の定義
const getters = {
  /**
   * 間違えた問題の総数を取得
   * @param {Object} state ストアの状態
   * @returns {number} 間違えた問題の総数
   */
  totalMistakes: (state) => {
    return state.mistakesList.length;
  },
  
  /**
   * 科目ごとの間違えた問題数を取得
   * @param {Object} state ストアの状態
   * @returns {Object} 科目コードをキー、問題数を値とするオブジェクト
   */
  mistakesBySubject: (state) => {
    const result = {};
    state.mistakesList.forEach(mistake => {
      if (!result[mistake.subject]) {
        result[mistake.subject] = 0;
      }
      result[mistake.subject]++;
    });
    return result;
  },
  
  /**
   * よく間違える問題（2回以上間違えた問題）の数を科目ごとに取得
   * @param {Object} state ストアの状態
   * @returns {Object} 科目コードをキー、よく間違える問題の数を値とするオブジェクト
   */
  frequentMistakesBySubject: (state) => {
    const result = {};
    state.mistakesList.forEach(mistake => {
      if (mistake.count >= 2) {
        if (!result[mistake.subject]) {
          result[mistake.subject] = 0;
        }
        result[mistake.subject]++;
      }
    });
    return result;
  },
  
  /**
   * 科目ごとの間違えた問題リストを取得
   * @param {Object} state ストアの状態
   * @returns {Function} 科目コードを引数に取り、その科目の間違えた問題リストを返す関数
   */
  mistakesListBySubject: (state) => (subject) => {
    return state.mistakesList
      .filter(mistake => mistake.subject === subject)
      .sort((a, b) => b.count - a.count); // 間違えた回数の多い順にソート
  },
  
  /**
   * 科目とトピックごとの間違えた問題リストを取得
   * @param {Object} state ストアの状態
   * @returns {Function} 科目コードとトピックコードを引数に取り、その条件に一致する間違えた問題リストを返す関数
   */
  mistakesListBySubjectAndTopic: (state) => (subject, topic) => {
    return state.mistakesList
      .filter(mistake => mistake.subject === subject && mistake.topic === topic)
      .sort((a, b) => b.count - a.count); // 間違えた回数の多い順にソート
  },
  
  /**
   * よく間違える問題（2回以上間違えた問題）のリストを取得
   * @param {Object} state ストアの状態
   * @returns {Array} よく間違える問題のリスト
   */
  frequentMistakesList: (state) => {
    return state.mistakesList
      .filter(mistake => mistake.count >= 2)
      .sort((a, b) => b.count - a.count); // 間違えた回数の多い順にソート
  },
  
  /**
   * クリア不可メッセージの取得（次の日曜18時対応版）
   * @returns {Function} 間違えた問題を引数に取り、クリア可能までの残り時間メッセージを返す関数
   */
  getLockedMessage: () => (mistake) => {
    if (mistake.isClearable) {
      return "クリア可能です";
    }
    
    const clearableAt = new Date(mistake.clearableAt);
    return `次の日曜18時(${clearableAt.toLocaleDateString()})までクリアできません。残り時間: ${getRemainingTimeString(clearableAt)}`;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
