const inputUsername = document.getElementById('input-usuario');
const botao = document.getElementById('botao-pesquisar');
const mensagemInicial = document.getElementById('mensagem-inicial');
const containerResultado = document.getElementById('container-resultado');
const containerErro = document.getElementById('erro');
const avatar = document.getElementById('avatar');
const nome = document.getElementById('nome');
const usuarioLink = document.getElementById('usuario');
const biografia = document.getElementById('biografia');
const qtdeRepositorios = document.getElementById('qtdeRepositorios');
const qtdeSeguidores = document.getElementById('qtdeSeguidores');
const qtdeSeguindo = document.getElementById('qtdeSeguindo');
const blog = document.getElementById('blog');
const listaRecentes = document.getElementById('lista-recentes');
const cardRepos = document.getElementById('card-repos');
const cardSeguidores = document.getElementById('card-seguidores');
const cardSeguindo = document.getElementById('card-seguindo');
const listaDetalhes = document.getElementById('lista-detalhes');
let usuariosRecentes = [];
let usuarioAtual = '';

async function getInformacoesGithub(username) {
  try {
    listaDetalhes.classList.add('oculto');
    listaDetalhes.innerHTML = '';

    const resposta = await fetch(`https://api.github.com/users/${username}`);

    if (!resposta.ok) {
      if (resposta.status === 404) {
        throw new Error("Usuário não encontrado");
      }

      throw new Error("Erro ao buscar usuário");
    }

    const dados = await resposta.json();
    exibirInformacoesUsuario(dados);
    addUserRecente(dados.login);
    
  } catch(error) {
    exibirErro(error.message);
  }
}

function exibirInformacoesUsuario(dados) {
  usuarioAtual = dados.login;
  avatar.src = dados.avatar_url;
  nome.textContent = dados.name || "Nome não encontrado";
  usuarioLink.textContent = `@${dados.login}`;
  usuarioLink.href = dados.html_url;
  biografia.textContent = dados.bio || "Bio não encontrada"
  qtdeRepositorios.textContent = dados.public_repos;
  qtdeSeguidores.textContent = dados.followers;
  qtdeSeguindo.textContent = dados.following;

if (dados.blog) {
    if (dados.blog.startsWith('http')) {
        blog.href = dados.blog;
    } else {
        blog.href = `https://${dados.blog}`;
    }
    
    blog.style.display = "block";
} else {
    blog.style.display = "none";
}

  mensagemInicial.classList.add('oculto');
  containerErro.classList.add('oculto');
  containerResultado.classList.remove('oculto');
}

function exibirErro(mensagem) {
    listaDetalhes.classList.add('oculto');
    mensagemInicial.classList.add('oculto');
    containerResultado.classList.add('oculto');

    const msgDeErro = containerErro.querySelector('p');
    if (msgDeErro) {
        msgDeErro.textContent = mensagem;
    } else {
        containerErro.textContent = mensagem;
    }
    
    containerErro.classList.remove('oculto');
}

function addUserRecente(username) {
  const index = usuariosRecentes.indexOf(username);
  if (index !== -1) {
    usuariosRecentes.splice(index, 1);
  }

  usuariosRecentes.unshift(username); 

  if (usuariosRecentes.length > 10) {
    usuariosRecentes.pop();
  }

  sidebarRecentes();
}

function sidebarRecentes() {
  listaRecentes.innerHTML = '';

  if (usuariosRecentes.length === 0) {
    listaRecentes.innerHTML = '<li>Nenhuma busca recente.</li>';
    return;
  }

  usuariosRecentes.forEach(username => {
    listaRecentes.innerHTML += `
      <li>
        <a href="#" onclick="buscarUsuario('${username}')">
          @${username}
        </a>
      </li>
    `;
  });
}

function buscarUsuario(username) {
  getInformacoesGithub(username);
}

botao.addEventListener('click', () => {
  const termoBusca = inputUsername.value.trim();

  if (termoBusca) {
    getInformacoesGithub(termoBusca);
    inputUsername.value = '';
  }
});

async function buscarDetalhes(tipo) {
  try {
    const resposta = await fetch(`https://api.github.com/users/${usuarioAtual}/${tipo}`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar dados");
    }

    const dados = await resposta.json();
    cardDetalhes(dados, tipo);

  } catch (erro) {
    console.log("Erro ao buscar detalhes");
  }
}

function cardDetalhes(dados, tipo) {
  listaDetalhes.innerHTML = '';
  listaDetalhes.classList.remove('oculto');

  let titulo = '';

  if (tipo === 'repos') titulo = 'Repositórios';
  if (tipo === 'followers') titulo = 'Seguidores';
  if (tipo === 'following') titulo = 'Seguindo';

  listaDetalhes.innerHTML = `<h3>${titulo}</h3><ul id="lista-itens"></ul>`;

  const ul = document.getElementById('lista-itens');

  if (dados.length === 0) {
    ul.innerHTML = '<li>Nenhum resultado encontrado.</li>';
    return;
  }

  dados.forEach(item => {
    if (tipo === 'repos') {
      ul.innerHTML += `
        <li>
          <a href="${item.html_url}" target="_blank">
            ${item.name}
          </a>
        </li>
      `;
    }

    if (tipo === 'followers' || tipo === 'following') {
      ul.innerHTML += `
        <li>
          <a href="${item.html_url}" target="_blank">
            @${item.login}
          </a>
        </li>
      `;
    }
  });
}

cardRepos.addEventListener('click', () => {
  buscarDetalhes('repos');
});

cardSeguidores.addEventListener('click', () => {
  buscarDetalhes('followers');
});

cardSeguindo.addEventListener('click', () => {
  buscarDetalhes('following');
});