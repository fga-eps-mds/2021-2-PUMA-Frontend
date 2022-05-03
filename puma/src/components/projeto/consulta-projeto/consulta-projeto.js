/* eslint-disable*/
import ProjectService from '../../../services/ProjectService';

const statusProjetoEnum = require('../../../utils/enums/status-projeto.enum');

export default {
  name: 'ConsultaProjetos',
  data() {
    return {
      data: {
        columns: [
          {
            label: 'ITEM',
            field: 'projectid',
            sort: 'asc',
          },
          {
            label: 'TÍTULO',
            field: 'name',
            sort: 'desc',
          },
          {
            label: 'AUTOR',
            field: 'fullname',
            sort: 'desc',
          },
          {
            label: 'DATA CADASTRO',
            field: 'createdat',
            sort: 'desc',
          },
          {
            label: 'STATUS',
            field: 'status',
            sort: 'desc',
          },
          {
            label: 'DISCIPLINA',
            field: 'subject',
            sort: 'desc',
          },
          {
            label: '',
            field: 'buttons',
          },
        ],
        rows: [],
      },
      wasLoaded: false,
      projects: [],
      projectService: new ProjectService(),
      operacao: '',
    };
  },
  watch: {
    '$route': {
      handler: 'getProjects',
      immediate: true,
    }
  },
  methods: {
    getProjects() {
      this.operacao = this.$route.path.slice(1);
      let user = this.$store.getters.user;
      user.operation = this.operacao;
      this.$store.commit('OPEN_LOADING_MODAL', { title: 'Carregando...' });
      this.projectService.getMyProposals(user).then((response) => {
        this.projects = response.data;
        this.data.rows.splice(0);
        this.configTableRows();
        if (!this.wasLoaded) {
          this.configSearchDiv();
          this.configSearch(this.configSearchInput(), this.configSearchIcon());
          this.configTable();
          this.wasLoaded = true;
        }
        this.markThsAsTouched();
        this.setSvgStyles();
        this.configAddProjectButton(document.getElementsByTagName('input')[0]);
        this.$store.commit('CLOSE_LOADING_MODAL');
      }).catch(() => {
        this.$store.commit('CLOSE_LOADING_MODAL');
        this.makeToast('ERRO', 'Erro ao recuperar projetos', 'danger');
      });
    },
    makeToast: function (title, message, variant) {
      this.$bvToast.toast(message, { title: title, variant: variant, solid: true, autoHideDelay: 4000 });
    },
    configTableRows() {
      this.projects.forEach((project) => {
        const row = project;
        row.etapa = project.status === 'IC' || project.status === 'EX' || project.status === 'EC' ? 'Projeto' : 'Proposta';
        row.status = statusProjetoEnum(project.status);
        row.name = project.name.slice(0, 20);
        const projectCreateDate = new Date(project.createdat);
        row.createdat = projectCreateDate.getDate() + '/' + (String(projectCreateDate.getMonth() + 1)).padStart(2, '0') + '/' + projectCreateDate.getFullYear();
        row.buttons = '<button name="visualizar" class="btn cp-btn mx-2" id=' + project.projectid + '><i class="fa-solid fa-circle-info mr-2 ml-0"></i>VER DETALHES</button>';
        this.data.rows.push(row);
      });
    },
    configTable() {
      const table = document.getElementsByTagName('table')[0];
      table.deleteTFoot();
      table.id = 'projects-table';

      const headerDiv = document.getElementsByClassName('col-sm-6 col-md-8')[0];
      headerDiv.remove();

      this.addTdListener();
    },
    configSearchDiv() {
      const inputDiv = document.getElementsByClassName('dataTables_filter')[0];
      inputDiv.classList.remove('float-right');
      inputDiv.classList.add('ml-4');
      inputDiv.classList.add('input-group');
      inputDiv.style.flexDirection = 'column';
    },
    configSearchInput() {
      const searchInput = document.getElementsByTagName('input')[0];
      searchInput.placeholder = 'Pesquise por item, disciplina, status...';
      // searchInput.setAttribute('value', 'math');
      // searchInput.dispatchEvent(new Event('input'));
      searchInput.classList.add('search-input');
      searchInput.style.width = '100%';
      return searchInput;
    },
    configSearchIcon() {
      const searchIcon = document.createElement('i');
      searchIcon.classList.add('fas');
      searchIcon.classList.add('fa-search');
      searchIcon.classList.add('input-group-prepend');
      searchIcon.classList.add('search-icon');
      return searchIcon;
    },
    configSearch(searchInput, searchIcon) {
      searchInput.after(searchIcon);
    },
    configAddProjectButton(searchInput) {
      if (!document.getElementById('btn-add-project') && this.operacao === 'meus-projetos') {
        const addProjectButton = document.createElement('button');
        addProjectButton.classList.add('btn', 'cp-btn', 'mt-3', 'col-md-8');
        addProjectButton.innerHTML = '<i class="fa-solid fa-plus-circle mr-2 add-project"></i>ADICIONAR PROJETO';
        addProjectButton.name = 'cadastrar';
        addProjectButton.id = 'btn-add-project';
        addProjectButton.addEventListener('click', () => {
          this.$router.push({ path: `/meus-projetos/cadastrar` }).catch(() => { });
        });
        searchInput.after(addProjectButton);
      }
      if (this.operacao !== 'meus-projetos' && document.getElementById('btn-add-project')) {
        document.getElementById('btn-add-project').remove();
      }
    },
    addTdListener() {
      document.querySelector("#projects-table tbody").addEventListener("click", (event) => {
        const button = event.target;
        const operacao = button.name;
        const path = this.$route.path.slice(1);
        if (button.id) {
          this.$router.push({ path: `/${path}/visualizar/${button.id}` }).catch(() => { });
        }
      });
    },
    markThsAsTouched() {
      if (document.getElementsByTagName('td')[0] && document.getElementsByTagName('td')[6]) {
        const firstValue = Number(document.getElementsByTagName('td')[0].textContent);
        const secondValue = Number(document.getElementsByTagName('td')[6].textContent);
        if (firstValue > secondValue) {
          document.getElementsByTagName('th')[0].dispatchEvent(new MouseEvent("dblclick"));
        } else {
          document.getElementsByTagName('th')[0].click();
        }
      }
    },
    setSvgStyles() {
      const svgs = document.getElementsByTagName('svg');
      if (svgs.item(3) && svgs.item(7)) {
        svgs.item(3).style.marginLeft = '15px';
        svgs.item(7).style.marginLeft = '15px';
      }
    },
  },
};
