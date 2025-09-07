import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type ResetPasswordCodeEmailProps = {
  /** Código numérico/alfanumérico gerado no backend */
  code: number;
  /** Nome do usuário (opcional) */
  name?: string;
  /** Ano atual (para rodapé) */
  year?: number;
  /** E-mail de suporte (opcional) */
  supportEmail?: string;
};

export default function ResetPasswordCodeEmail({
  code = 928371,
  name,
  year = new Date().getFullYear(),
  supportEmail = 'suporte@domo.app',
}: ResetPasswordCodeEmailProps) {
  const preview = `Seu código para redefinir a senha do Domo: ${code}`;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>

      {/* Tailwind é opcional, mas facilita estilos no e-mail */}
      <Tailwind>
        <Body className="bg-gray-50 m-0 p-0 font-sans">
          <Container className="max-w-[600px] my-10 mx-auto bg-white rounded-xl p-8 shadow-sm">
            <Section>
              <Text className="text-xl font-semibold text-gray-900 m-0">
                Redefinição de senha
              </Text>
              <Text className="text-base text-gray-700 mt-3">
                {name ? `Olá, ${name}.` : 'Olá,'}
              </Text>

              <Text className="text-base text-gray-700">
                Recebemos um pedido para redefinir a sua senha de acesso ao{' '}
                <strong>Domo</strong>. Use o código abaixo para continuar o
                processo no aplicativo:
              </Text>

              {/* Bloco do código */}
              <Section className="mt-4 mb-2">
                <div className="flex justify-center w-full gap-4 text-center bg-gray-900 text-white rounded-lg py-3 tracking-[0.35em] text-2xl font-bold">
                  {code
                    .toString()
                    .split('')
                    .map((codeNumber, index) => (
                      <Text key={`${codeNumber}-${index}`} className="text-4xl">
                        {codeNumber}
                      </Text>
                    ))}
                </div>
                <Text className="text-xs text-gray-500 text-center mt-2">
                  O código expira em 10 minutos.
                </Text>
              </Section>

              <Hr className="my-6 border-gray-200" />

              <Text className="text-sm text-gray-600">
                Se você <strong>não</strong> solicitou essa redefinição, ignore
                este e-mail. Sua senha permanecerá inalterada.
              </Text>

              <Text className="text-sm text-gray-600">
                Precisa de ajuda? Fale com a gente:{' '}
                <span className="text-gray-900">{supportEmail}</span>
              </Text>

              <Text className="text-xs text-gray-500 text-center mt-8">
                © {year} Domo. Todos os direitos reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
