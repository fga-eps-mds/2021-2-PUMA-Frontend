/* eslint-disable */
import { extend } from 'vee-validate';
import { regex } from 'vee-validate/dist/rules';
import Loading from '../../shared/loading/Loading.vue';
import UserService from '../../../services/UserService';
import VisitorNav from '../../../components/VisitorNav/VisitorNav.vue';

export default {
  name: 'CadastroUsuario',
  components: {
    Loading,
    VisitorNav,
  },
  mounted() {
    document.title = 'PUMA | Cadastro Usuário';
  },
  data() {
    return {
      userService: new UserService(),
      name: '',
      email: '',
      phoneNumber: '',
      matricula: '',
      password: '',
      repeatPassword: '',
      cnpj: '',
      companyName: '',
      socialReason: '',
      cpf: '',
      type: '',
      externalAgentType: '',
      passwordTypeText: false,
      repeatPasswordTypeText: false,
      isFirstPage: true,
      isLoading: false,
      hasMatricula: false,
      isJuridical: false,
      isPhysical: false,
      isExternalAgent: false,
      navs: [{ title: 'HOME' }, { title: 'CADASTRO' }],
    };
  },
  methods: {
    async onSubmit() {
      const isValid = await this.$refs.observer.validate();
      if (isValid) {
        const newUser = {
          name: this.name,
          email: this.email,
          phoneNumber: this.clearMask(this.phoneNumber),
          password: this.password,
          repeatPassword: this.repeatPassword,
          matricula: this.clearMask(this.matricula),
          type: this.type,
          externalAgentType: this.externalAgentType,
          cnpj: this.clearMask(this.cnpj),
          cpf: this.clearMask(this.cpf),
          companyName: this.companyName,
          socialReason: this.socialReason,
        };
        this.isLoading = true;
        this.userService.registerUser(newUser).then(async () => {
          await this.$router.push('/usuario/login');
          this.makeToast('SUCESSO', 'Cadastro feito com sucesso!', 'success');
        }).catch(() => {
          this.isLoading = false;
          this.makeToast('ERRO', 'Uma falha ocorreu ao efetuar o cadastro. Tente novamente.', 'danger');
        });
      }
    },
    makeToast: function (title, message, variant) {
      this.$bvToast.toast(message, { title: title, variant: variant, solid: true, autoHideDelay: 4000 });
    },
    alterarTipoUsuario() {
      if (this.type === 'Aluno' || this.type === 'Professor') {
        this.hasMatricula = true;
        this.isExternalAgent = false;
        this.isJuridical = false;
        this.isPhysical = false;
        this.externalAgentType = '';
      } else if (this.type === 'Agente Externo') {
        this.hasMatricula = false;
        this.isExternalAgent = true;
      }
      this.matricula = '';
      this.clearJuridicalAgentData();
    },
    alterarTipoAgenteExterno() {
      this.clearJuridicalAgentData();
      this.clearPhysicalAgentData();
      if (this.externalAgentType === 'Pessoa Fisica') {
        this.isPhysical = true;
        this.isJuridical = false;
      } else if (this.externalAgentType === 'Pessoa Juridica') {
        this.isJuridical = true;
        this.isPhysical = false;
      } else {
        this.isPhysical = false;
        this.isJuridical = false;
      }
    },
    clearJuridicalAgentData() {
      this.socialReason = '';
      this.cnpj = '';
      this.companyName = '';
    },
    clearPhysicalAgentData() {
      this.cpf = '';
    },
    clearMask(maskedValue) {
      return maskedValue.replace(/_|-|\(|\)|\.|\/|\s/g, '');
    },
  },
};

extend('regex', {
  // eslint-disable-next-line camelcase
  ...regex,
  message: 'Precisa ter letras e números',
});