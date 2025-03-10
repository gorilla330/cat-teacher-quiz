import { createStore } from 'vuex';
import DataManager from '@/services/DataManager';
import mistakes from './modules/mistakes';

// DataManagerのインスタンスを作成
const dataManager = new DataManager();

export default createStore({
  modules: {
    mistakes
  },
  state: {
    subjects: [],
    currentSubject: null,
    currentTopic: null,
    problems: [],
    metadata: null,
    loading: false,
    error: null,
    // ユーザー関連の状態
    userData: {
      currentRank: 'ビギナー',
      score: 0,
      completedTopics: {},
      lastPlayed: null
    }
  },
  getters: {
    getSubjects: (state) => state.subjects,
    getCurrentSubject: (state) => state.currentSubject,
    getCurrentTopic: (state) => state.currentTopic,
    getProblems: (state) => state.problems,
    getMetadata: (state) => state.metadata,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getUserData: (state) => state.userData
  },
  mutations: {
    SET_SUBJECTS(state, subjects) {
      state.subjects = subjects;
    },
    SET_CURRENT_SUBJECT(state, subject) {
      state.currentSubject = subject;
    },
    SET_CURRENT_TOPIC(state, topic) {
      state.currentTopic = topic;
    },
    SET_PROBLEMS(state, problems) {
      state.problems = problems;
    },
    SET_METADATA(state, metadata) {
      state.metadata = metadata;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_USER_DATA(state, userData) {
      state.userData = userData;
    },
    // 特定のトピックの完了状態を更新
    UPDATE_TOPIC_COMPLETION(state, { subjectCode, topicCode, completed, score }) {
      if (!state.userData.completedTopics[subjectCode]) {
        state.userData.completedTopics[subjectCode] = {};
      }
      
      state.userData.completedTopics[subjectCode][topicCode] = {
        completed,
        score,
        completedAt: new Date().toISOString()
      };
      
      // 最終プレイ日時を更新
      state.userData.lastPlayed = new Date().toISOString();
    },
    // ユーザーのランクを更新
    UPDATE_USER_RANK(state, rank) {
      state.userData.currentRank = rank;
    },
    // ユーザーの総スコアを更新
    UPDATE_USER_SCORE(state, score) {
      state.userData.score = score;
    }
  },
  actions: {
    // 科目データを読み込む
    async loadSubjectsData({ commit }, options = {}) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // 強制再読み込みオプションが指定されている場合はキャッシュをクリア
        if (options.forceRefresh) {
          // DataManagerのキャッシュをクリア
          dataManager.clearCache();
          console.log('データマネージャーのキャッシュをクリアしました');
        }
        
        const indexData = await dataManager.loadIndex();
        commit('SET_SUBJECTS', indexData.subjects);
        console.log('科目データを読み込みました:', indexData.subjects);
      } catch (error) {
        commit('SET_ERROR', error.message);
        console.error('科目データの読み込み中にエラーが発生しました:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 特定の科目とトピックの問題データを読み込む
    async loadProblems({ commit, dispatch }, { subjectCode, topicCode, forceRefresh = false }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // キャッシュが古い可能性があるため、強制的に科目データを再読み込み
        if (forceRefresh) {
          // キャッシュを弾く
          dataManager.clearCache();
          await dispatch('loadSubjectsData', { forceRefresh: true });
          console.log('科目データを強制再読み込みしました');
        }
        
        // 科目リストを取得
        const subjects = await dataManager.getSubjects();
        console.log('利用可能な科目:', subjects.map(s => s.code));
        
        const subject = subjects.find(s => s.code === subjectCode);
        if (!subject) {
          throw new Error(`指定された科目コード「${subjectCode}」は存在しません。`);
        }
        
        // 科目の全トピックを詳細表示
        console.log(`科目 "${subject.name}" のトピック一覧:`, subject.topics.map(t => ({ 
          code: t.code, 
          name: t.name,
          icon: t.icon,
          dataFiles: t.dataFiles
        })));
        
        // トピックリストを取得
        const topics = await dataManager.getTopics(subjectCode);
        const topic = topics.find(t => t.code === topicCode);
        
        if (!topic) {
          throw new Error(`指定された科目「${subjectCode}」にトピック「${topicCode}」は存在しません。`);
        }
        
        console.log(`選択されたトピック: ${topic.name} (${topicCode}), データファイル:`, topic.dataFiles);
        
        commit('SET_CURRENT_SUBJECT', subject);
        commit('SET_CURRENT_TOPIC', topic);
        
        // 問題データを読み込む
        const questions = await dataManager.getProblems(subjectCode, topicCode);
        console.log(`トピック "${topic.name}" のロードされた問題数:`, questions.length);
        
        // questions配列を取得してストアにセット
        if (questions && Array.isArray(questions)) {
          // 問題データが空でないことを確認
          if (questions.length > 0) {
            commit('SET_PROBLEMS', questions);
            console.log(`問題データをセットしました: ${questions.length}個の問題`);
          } else {
            console.error('問題データが空です');
            commit('SET_PROBLEMS', []);
          }
        } else {
          console.error('問題データの形式が不正です:', questions);
          commit('SET_PROBLEMS', []);
        }
        
        // メタデータを取得してストアにセット
        const metadata = await dataManager.getMetadata(subjectCode, topicCode);
        if (metadata) {
          commit('SET_METADATA', metadata);
          console.log('メタデータをセットしました:', metadata);
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
        console.error('問題データの読み込み中にエラーが発生しました:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // ユーザーデータをローカルストレージから読み込む
    loadUserData({ commit }) {
      try {
        const userData = localStorage.getItem('catTeacherUserData');
        if (userData) {
          commit('SET_USER_DATA', JSON.parse(userData));
        }
      } catch (error) {
        console.error('ユーザーデータの読み込み中にエラーが発生しました:', error);
      }
    },
    
    // ユーザーデータをローカルストレージに保存する
    saveUserData({ state }) {
      try {
        localStorage.setItem('catTeacherUserData', JSON.stringify(state.userData));
      } catch (error) {
        console.error('ユーザーデータの保存中にエラーが発生しました:', error);
      }
    },
    
    // トピックの完了状態を更新する
    updateTopicCompletion({ commit, dispatch }, { subjectCode, topicCode, completed, score }) {
      commit('UPDATE_TOPIC_COMPLETION', { subjectCode, topicCode, completed, score });
      dispatch('saveUserData');
    },
    
    // ユーザーのランクを更新する
    updateUserRank({ commit, dispatch }, rank) {
      commit('UPDATE_USER_RANK', rank);
      dispatch('saveUserData');
    },
    
    // ユーザーの総スコアを更新する
    updateUserScore({ commit, dispatch }, score) {
      commit('UPDATE_USER_SCORE', score);
      dispatch('saveUserData');
    }
  }
});
