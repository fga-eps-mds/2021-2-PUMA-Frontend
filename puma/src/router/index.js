import Vue from 'vue';
import VueRouter from 'vue-router';

import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/usuario/login-usuario/LoginUsuario.vue'),
    meta: {
      guest: true,
    },
  },
  {
    path: '/usuario/login',
    name: 'Entrar',
    component: () => import('../components/usuario/login-usuario/LoginUsuario.vue'),
    meta: {
      guest: true,
    },
  },
  {
    path: '/usuario/cadastro',
    name: 'Cadastro Usuário',
    component: () => import('../components/usuario/cadastro-usuario/CadastroUsuario.vue'),
    meta: {
      guest: true,
    },
  },
  {
    path: '/usuario/recuperacao-senha',
    name: 'Recuperação Senha',
    component: () => import('../components/usuario/recovery-password/RecoveryPassword.vue'),
    meta: {
      guest: true,
    },
  },
  {
    path: '/usuario/atualizar-senha',
    name: 'Nova Senha',
    component: () => import('../components/usuario/new-password/NewPassword.vue'),
    meta: {
      guest: true,
    },
  },
  {
    path: '/projetos-plataforma',
    name: 'Consulta de Projetos',
    component: () => import('../components/projeto/consulta-projeto/ConsultaProjeto.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projetos-plataforma/visualizar/:id',
    name: 'Visualizar Projeto',
    component: () => import('../components/projeto/ViewProject/ViewProject.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projetos-disciplina',
    name: 'Projetos por Disciplina',
    component: () => import('../components/projeto/consulta-projeto/ConsultaProjeto.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/projetos-disciplina/visualizar/:id',
    name: 'Consulta por Disciplina Visualizar',
    component: () => import('../components/projeto/ViewProject/ViewProject.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/meus-projetos',
    name: 'Meus Projetos',
    component: () => import('../components/projeto/consulta-projeto/ConsultaProjeto.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/meus-projetos/cadastrar',
    name: 'Cadastro de Projeto',
    component: () => import('../components/projeto/cadastro-projeto/CadastroProjeto.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/meus-projetos/visualizar/:id',
    name: 'Visualizar Meu Projeto',
    component: () => import('../components/projeto/ViewMyProject/ViewMyProject.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/disciplinas',
    name: 'Disciplinas',
    component: () => import('../components/disciplina/consulta-disciplina/ConsultaDisciplina.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/disciplinas/cadastrar',
    name: 'Cadastro de Disciplina',
    component: () => import('../components/disciplina/cadastro-disciplina/CadastroDisciplina.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/disciplinas/editar/:id',
    name: 'Edição de Disciplina',
    component: () => import('../components/disciplina/cadastro-disciplina/CadastroDisciplina.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/disciplinas/visualizar/:id',
    name: 'Visualização d Disciplina',
    component: () => import('../components/disciplina/cadastro-disciplina/CadastroDisciplina.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/palavras-chave',
    name: 'Palavras Chave',
    component: () => import('../components/palavras-chave/KeyWords.vue'),
    meta: {
      requiresAuth: true,
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      next({
        path: '/usuario/login',
        params: { nextUrl: to.fullPath },
      });
    } else {
      next();
    }
  } else if (to.matched.some((record) => record.meta.guest)) {
    if (!store.getters.isAuthenticated) {
      next();
    } else {
      next({ path: '/' });
    }
  } else {
    next();
  }
});

export default router;
