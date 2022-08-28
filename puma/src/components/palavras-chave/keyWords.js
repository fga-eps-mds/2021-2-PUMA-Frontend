/* eslint-disable*/
import KeywordService from '../../services/KeywordService';
import SubjectService from '../../services/SubjectService';

export default {
  data() {
    return {
      kwNameAlreadyExist: { state: false, keywords: [] },
      multiSelectPlaceholder: 'Carregando opções...',
      keywordService: new KeywordService(),
      subjectService: new SubjectService(),
      openModalRegister: false,
      openModalEdit: false,
      currentKeyWord: {},
      keywordDelete: null,
      selected: null,
      form: { keywordName: '', selectedSubject: null },
      idKeywordEdit: '',
      idSubjectEdit: '',
      flag: false,
      subjects: [],
      subjectsForm: [],
      subjectsList: [],
      isLoadingKeywords: false,
      optionsSelected: [],
      keyWords: [],
      keywordsInfo: {},
      tableKeywordSubject: [],
      subjectsFields: [
        {
          key: 'id',
          label: 'idDisciplina',
        },
        {
          key: 'name',
          label: 'subjectname',
        },
      ],
      keyWordsFields: [
        {
          key: 'keywordid',
          label: 'ITEM',
        },
        {
          key: 'keyword',
          label: 'PALAVRA-CHAVE',
        },
        {
          key: 'subjectname',
          label: 'DISCIPLINA',
        },
        {
          key: 'actions',
          label: '',
        },
      ],
    };
  },
  created() {
    this.handleLoadData().then(() => {});
  },
  methods: {
    async handleLoadData() {
      try {
        this.$store.commit('OPEN_LOADING_MODAL', { title: 'Carregando...' });
        const { isAdmin } = this.$store.getters.user;
        await this.getKeywords();
        if (isAdmin) {
          await this.getSubjects();
        } else {
          await this.getSubjectsProfessor();
          await this.getFilterProfessor();
        }
        this.$store.commit('CLOSE_LOADING_MODAL');
      } catch (error) {
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Falha ao carregar os dados', 'danger');
      }
    },

    allowEdit(keyword) {
      const { isAdmin, userId } = this.$store.getters.user;
      if (isAdmin) return true;
      let flag = false;
      Object.values(this.keywordsInfo[keyword.keywordid]).forEach((profId) => {
        if (userId === profId) {
          flag = true;
        }
      });
      return flag;
    },

    async getKeywords() {
      try {
        const { data } = await this.keywordService.getKeywords();
        this.tableKeywordSubject = JSON.parse(JSON.stringify(data));
        this.keyWords = data;
        Object.keys(data).forEach((key) => {
          this.keywordsInfo[data[key].keywordid] = data[key].array_agg;
        });
      } catch (error) { }
    },

    async getSubjects() {
      try {
        const allSubjects = (await this.subjectService.getSubjects()).data.map((s) => ({ value: s.subjectid, text: s.name }));
        this.subjectsForm = JSON.parse(JSON.stringify(allSubjects));
        this.subjectsForm.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
        this.subjects = JSON.parse(JSON.stringify(allSubjects));
        this.subjects.unshift({ value: 0, text: 'Todas as Disciplinas' });
        this.subjects.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
      } catch (error) { }
    },

    async getSubjectsProfessor() {
      try {
        const { userId } = this.$store.getters.user;
        const subjectByKeywords = [];
        Object.keys(this.keyWords).forEach((key) => {
          Object.values(this.keyWords[key].array_agg).forEach((allowId) => {
            if (allowId === userId) {
              subjectByKeywords.push({ value: this.keyWords[key].subjectid, text: this.keyWords[key].subjectname });
            }
          });
        });
        this.subjectsForm = [...new Set(subjectByKeywords.map((o) => JSON.stringify(o)))].map((s) => (JSON.parse(s)));
        this.subjectsForm.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
      } catch (erro) { }
    },

    async getFilterProfessor() {
      try {
        const allSubjects = (await this.subjectService.getSubjects()).data.map((s) => ({ value: s.subjectid, text: s.name }));
        this.subjects = JSON.parse(JSON.stringify(allSubjects));
        this.subjects.unshift({ value: 0, text: 'Todas as Disciplinas' });
        this.subjects.unshift({ value: null, text: 'Escolha a disciplina', disabled: true });
      } catch (error) { }
    },

    filter(subjectId) {
      this.tableKeywordSubject = this.keyWords;
      if (subjectId === 0) {
        this.tableKeywordSubject = this.keyWords;
      } else {
        this.tableKeywordSubject = this.tableKeywordSubject.filter((d) => d.subjectid === subjectId);
      }
    },

    addKeyword() {
      this.openModalRegister = true;
      this.form = { keywordName: '', selectedSubject: null };
    },

    editKeyword(keyword) {
      this.openModalEdit = true;
      this.idKeywordEdit = keyword.keywordid;
      this.form = { keywordName: keyword.keyword, selectedSubject: keyword.subjectid };
    },

    deleteKeyword(keyWord) {
      this.$store.commit('OPEN_CONFIRM_MODAL', {
        title: 'EXCLUIR PALAVRA-CHAVE',
        content: 'Confirmar exclusão da palavra-chave ?',
        okButton: {
          text: 'Confirmar', variant: 'danger',
          onClick: () => { this.handleDelete(); this.$store.commit('CLOSE_CONFIRM_MODAL'); },
        },
        cancelButton: {
          text: 'Cancelar', variant: 'outline-danger',
          onClick: () => this.$store.commit('CLOSE_CONFIRM_MODAL'),
        },
      });
      this.keywordDelete = keyWord.keywordid;
    },

    keywordNameAlreadyExist(edit = false) {
      const sanitazedKeywords = this.sanitazeKeywordsList(this.form.keywordName);
      const splitedKeywords = this.splitValue(sanitazedKeywords);
      this.kwNameAlreadyExist.state = false;
      this.kwNameAlreadyExist.keywords.splice(0);
      this.tableKeywordSubject.forEach((k) => {
        splitedKeywords.forEach((sk) =>  {
          const condition = (sk.toLowerCase() === this.sanitazeKeywordsList(k.keyword).toLowerCase());
          if ((!edit && condition) || (edit && condition && (k.keywordid !== this.idKeywordEdit))) {
            this.kwNameAlreadyExist.keywords.push(sk);
            this.kwNameAlreadyExist.state = true;
          }
        })
      });
    },

    sanitazeKeywordsList(keywordsList) {
      return keywordsList.replace(/[^a-z^;A-Z]/g, '');
    },

    getFormatedAlteradyExistingKeywords() {
      let keywords = '';
      const length = this.kwNameAlreadyExist.keywords.length;
      this.kwNameAlreadyExist.keywords.forEach((kw, index) => {
        keywords += `"${kw}"`;
        if (index !== length-1) {
          keywords += index === length-2 ? ' e ' : ',';
        }
      });
      keywords += ` já${length > 1 ? ' existem' : ' existe'}`;
      keywords += '. Tente novamente.';
      return keywords;
    },

    splitValue(sanitazedKeywords) {
      const splitedValue = sanitazedKeywords.split(';');
      if (splitedValue.some((v) => v !== '')) {
        return splitedValue.filter((v) => v !== '');
      } else {
        return [];
      }
    },

    async handleAdd() {
      try {
        this.keywordNameAlreadyExist();
        const isFormValid = await this.$refs.observer.validate();
        if (isFormValid && !this.kwNameAlreadyExist.state) {
          const sanitazedKeywords = this.sanitazeKeywordsList(this.form.keywordName);
          const splitedKeywords = this.splitValue(sanitazedKeywords);
          this.$store.commit('OPEN_LOADING_MODAL', { title: 'Enviando...' });
          for (const splitedKeyword of splitedKeywords) {
            const response = await this.keywordService.addKeyword(splitedKeyword);
            const currentKeywordid = response.data.keywordid;
            const idSubject = this.form.selectedSubject;

            await this.keywordService.addKeywordToSubject(currentKeywordid, idSubject);
            await this.getKeywords();

            this.openModalRegister = false;
            this.$store.commit('CLOSE_LOADING_MODAL');
          }
          this.makeToast('SUCESSO', 'Cadastro realizado com sucesso!', 'success');
        }
      } catch (error) {
        this.openModalRegister = false;
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Infelizmente houve um erro ao tentar cadastrar a palavra-chave', 'danger');
      }
    },

    async handleEdit() {
      try {
        const isFormValid = await this.$refs.observer.validate();
        if (isFormValid && !this.kwNameAlreadyExist.state) {
          this.$store.commit('OPEN_LOADING_MODAL', { title: 'Enviando...' });
          const response = await this.keywordService.updateKeyword(this.idKeywordEdit, this.form.keywordName);
          const idKeywordUpdated = response.data.keywordid;
          await this.keywordService.updateSubjectKeyword(idKeywordUpdated, this.form.selectedSubject);
          this.openModalEdit = false;
          this.$store.commit('CLOSE_LOADING_MODAL');
          this.makeToast('SUCESSO', 'Palavra-Chave editada com sucesso!', 'success');
          this.getKeywords().then(() => {});
        }
      } catch (error) {
        this.openModalEdit = false;
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Infelizmente houve um erro ao tentar editar a palavra-chave', 'danger');
      }
    },

    async handleDelete() {
      try {
        this.$store.commit('OPEN_LOADING_MODAL', { title: 'Enviando...' });
        await this.keywordService.deleteKeyword(this.keywordDelete);
        await this.getKeywords();
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('SUCESSO', 'Palavra-chave excluída com sucesso!', 'success');
      } catch (error) {
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Infelizmente houve um erro ao tentar excluir a palavra-chave', 'danger');
      }
    },

    makeToast(title, message, variant) {
      this.$bvToast.toast(message, { title: title, variant: variant, solid: true, autoHideDelay: 4000, });
    },
  },
};
