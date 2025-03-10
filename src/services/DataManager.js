/**
 * DataManager クラス
 * JSONデータを非同期に読み込み、科目・トピックリスト取得、問題データ取得などの機能を提供します
 * 複数のデータファイルに対応し、効率的なキャッシュ戦略を実装しています
 */
class DataManager {
  constructor() {
    // キャッシュデータを保持するオブジェクト
    this.cache = {
      index: null,         // subjects.jsonのキャッシュ
      problemFiles: {},   // 問題ファイルのキャッシュ（ファイル単位）
      topicProblems: {},  // トピック単位の問題キャッシュ（複数ファイルの結合結果）
      questionById: {}    // 問題IDによる検索用キャッシュ
    };
    
    // バージョン管理（キャッシュ制御用）
    this.version = '1.1.0'; // キャッシュを強制的にクリアするために更新
    this.checkCacheVersion();
  }
  
  /**
   * キャッシュバージョンをチェックし、必要に応じてクリアします
   */
  checkCacheVersion() {
    const savedVersion = localStorage.getItem('dataManagerVersion');
    if (savedVersion !== this.version) {
      // バージョンが異なる場合はキャッシュをクリア
      console.log(`キャッシュバージョンが異なるためクリアします (${savedVersion} → ${this.version})`);
      this.clearCache();
      localStorage.setItem('dataManagerVersion', this.version);
    }
  }
  
  /**
   * キャッシュをクリアします
   */
  clearCache() {
    this.cache = {
      index: null,
      problemFiles: {},
      topicProblems: {},
      questionById: {}
    };
    // ローカルストレージのキャッシュもクリア
    localStorage.removeItem('subjectsData');
  }

  /**
   * インデックスファイル（subjects.json）を非同期に読み込みます
   * @returns {Promise<Object>} 読み込まれたインデックスデータ
   */
  async loadIndex() {
    // キャッシュに存在する場合はキャッシュから返す
    if (this.cache.index) {
      return this.cache.index;
    }
    
    try {
      // ベースURLを考慮したパスを生成（末尾のスラッシュを含まない形式）
      const baseUrl = process.env.NODE_ENV === 'production' ? '/cat-teacher-quiz' : '';
      
      // キャッシュバスティングのためのタイムスタンプを追加
      const timestamp = new Date().getTime();
      const response = await fetch(`${baseUrl}/data/subjects.json?v=${timestamp}`);
      
      if (!response.ok) {
        throw new Error(`インデックスデータの読み込みに失敗しました: ${response.status}`);
      }
      
      const indexData = await response.json();
      // キャッシュに保存
      this.cache.index = indexData;
      
      // ローカルストレージにも保存（デバッグ用）
      localStorage.setItem('subjectsData', JSON.stringify(indexData));
      
      return indexData;
    } catch (error) {
      console.error('インデックスデータの読み込み中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 科目リストを取得します
   * @returns {Promise<Array>} 科目リスト
   */
  async getSubjects() {
    const indexData = await this.loadIndex();
    return indexData.subjects;
  }

  /**
   * 特定の科目のトピックリストを取得します
   * @param {string} subjectCode 科目コード
   * @returns {Promise<Array>} トピックリスト
   */
  async getTopics(subjectCode) {
    const indexData = await this.loadIndex();
    
    const subject = indexData.subjects.find(s => s.code === subjectCode);
    if (!subject) {
      throw new Error(`指定された科目コード「${subjectCode}」は存在しません。`);
    }
    
    return subject.topics;
  }

  /**
   * 特定のトピックに関連するデータファイルのリストを取得します
   * @param {string} subjectCode 科目コード
   * @param {string} topicCode トピックコード
   * @returns {Promise<Array>} データファイルのリスト
   */
  async getDataFiles(subjectCode, topicCode) {
    const indexData = await this.loadIndex();
    
    const subject = indexData.subjects.find(s => s.code === subjectCode);
    if (!subject) {
      throw new Error(`指定された科目コード「${subjectCode}」は存在しません。`);
    }
    
    const topic = subject.topics.find(t => t.code === topicCode);
    if (!topic) {
      throw new Error(`指定されたトピックコード「${topicCode}」は存在しません。`);
    }
    
    // 旧形式（dataFile）と新形式（dataFiles）の両方に対応
    if (topic.dataFiles) {
      return topic.dataFiles;
    } else if (topic.dataFile) {
      return [topic.dataFile];
    } else {
      throw new Error(`トピック「${topicCode}」にデータファイルが指定されていません。`);
    }
  }

  /**
   * 単一の問題ファイルを非同期に読み込みます
   * @param {string} fileName ファイル名
   * @returns {Promise<Object>} 問題データ
   */
  async loadProblemFile(fileName) {
    // キャッシュに存在する場合はキャッシュから返す
    if (this.cache.problemFiles[fileName]) {
      return this.cache.problemFiles[fileName];
    }
    
    try {
      // ベースURLを考慮したパスを生成
      const baseUrl = process.env.NODE_ENV === 'production' ? '/cat-teacher-quiz' : '';
      
      // キャッシュバスティングのためのタイムスタンプを追加
      const timestamp = new Date().getTime();
      const response = await fetch(`${baseUrl}/data/${fileName}?v=${timestamp}`);
      if (!response.ok) {
        throw new Error(`問題ファイル「${fileName}」の読み込みに失敗しました: ${response.status}`);
      }
      
      const fileData = await response.json();
      
      // データの検証
      if (!fileData.questions || !Array.isArray(fileData.questions)) {
        throw new Error(`問題ファイル「${fileName}」の形式が不正です。questions配列が見つかりません。`);
      }
      
      // キャッシュに保存
      this.cache.problemFiles[fileName] = fileData;
      
      // 問題IDによるインデックスを作成
      fileData.questions.forEach(question => {
        if (question.id) {
          this.cache.questionById[question.id] = question;
        }
      });
      
      return fileData;
    } catch (error) {
      console.error(`問題ファイル「${fileName}」の読み込み中にエラーが発生しました:`, error);
      throw error;
    }
  }

  /**
   * 特定のトピックに関連する全ての問題データを読み込みます
   * @param {string} subjectCode 科目コード
   * @param {string} topicCode トピックコード
   * @returns {Promise<Array>} 結合された問題リスト
   */
  async loadTopicProblems(subjectCode, topicCode) {
    const cacheKey = `${subjectCode}_${topicCode}`;
    
    // キャッシュに存在する場合はキャッシュから返す
    if (this.cache.topicProblems[cacheKey]) {
      console.log(`キャッシュから問題データを取得: ${subjectCode}_${topicCode}、問題数: ${this.cache.topicProblems[cacheKey].questions.length}`);
      return this.cache.topicProblems[cacheKey];
    }
    
    try {
      // トピックに関連するデータファイルのリストを取得
      const dataFiles = await this.getDataFiles(subjectCode, topicCode);
      console.log(`読み込むファイル一覧: ${JSON.stringify(dataFiles)}`);
      
      // 全てのファイルを読み込み、問題データを結合
      const allQuestions = [];
      const metadata = { subject: subjectCode, topic: topicCode };
      
      for (const fileName of dataFiles) {
        console.log(`ファイル読み込み開始: ${fileName}`);
        const fileData = await this.loadProblemFile(fileName);
        console.log(`ファイル読み込み完了: ${fileName}、問題数: ${fileData.questions.length}`);
        allQuestions.push(...fileData.questions);
        
        // メタデータをマージ（存在する場合）
        if (fileData.metadata) {
          Object.assign(metadata, fileData.metadata);
        }
      }
      
      console.log(`全ファイル読み込み完了、合計問題数: ${allQuestions.length}`);
      
      // 結合結果をキャッシュ
      const result = {
        subject: subjectCode,
        topic: topicCode,
        metadata: metadata,
        questions: allQuestions
      };
      
      this.cache.topicProblems[cacheKey] = result;
      return result;
    } catch (error) {
      console.error(`トピック「${subjectCode}_${topicCode}」の問題データ読み込み中にエラーが発生しました:`, error);
      throw error;
    }
  }

  /**
   * 特定のトピックの問題データを取得します
   * @param {string} subjectCode 科目コード
   * @param {string} topicCode トピックコード
   * @returns {Promise<Array>} 問題リスト
   */
  async getProblems(subjectCode, topicCode) {
    const problemsData = await this.loadTopicProblems(subjectCode, topicCode);
    return problemsData.questions;
  }

  /**
   * 特定のファイル番号の問題データを取得します
   * @param {string} subjectCode 科目コード
   * @param {number} fileNumber ファイル番号（1, 2, 3, ...）
   * @returns {Promise<Array>} 問題リスト
   */
  async getProblemsByFileNumber(subjectCode, fileNumber) {
    const fileName = `${subjectCode}${fileNumber}.json`;
    try {
      const fileData = await this.loadProblemFile(fileName);
      return fileData.questions;
    } catch (error) {
      console.error(`ファイル番号「${fileNumber}」の問題データ取得中にエラーが発生しました:`, error);
      throw error;
    }
  }

  /**
   * 問題IDから問題データを取得します
   * @param {string} questionId 問題ID
   * @returns {Promise<Object>} 問題データ
   */
  async getQuestionById(questionId) {
    // キャッシュに存在する場合はキャッシュから返す
    if (this.cache.questionById[questionId]) {
      return this.cache.questionById[questionId];
    }
    
    // キャッシュにない場合は、全てのインデックスを読み込み、全ての問題ファイルを検索する必要がある
    // これは非効率なので、通常はキャッシュから取得できるようにアプリケーションを設計すべき
    throw new Error(`問題ID「${questionId}」が見つかりません。先に関連するトピックの問題を読み込んでください。`);
  }

  /**
   * 特定の科目とトピックのメタデータを取得します
   * @param {string} subjectCode 科目コード
   * @param {string} topicCode トピックコード
   * @returns {Promise<Object>} メタデータ
   */
  async getMetadata(subjectCode, topicCode) {
    const problemsData = await this.loadTopicProblems(subjectCode, topicCode);
    return {
      subject: problemsData.subject,
      topic: problemsData.topic,
      metadata: problemsData.metadata
    };
  }

  /**
   * キャッシュをクリアします
   * @param {boolean} clearAll 全てのキャッシュをクリアするかどうか
   */
  clearCache(clearAll = false) {
    if (clearAll) {
      this.cache = {
        index: null,
        problemFiles: {},
        topicProblems: {},
        questionById: {}
      };
    } else {
      // インデックスは保持し、問題データのみクリア
      this.cache.problemFiles = {};
      this.cache.topicProblems = {};
      this.cache.questionById = {};
    }
  }
}

export default DataManager;
