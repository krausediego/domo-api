import { Body, Button, Container, Head, Hr, Html, Preview, Section, Tailwind, Text } from '@react-email/components';
import * as React from 'react';

type ConfirmEmailLinkEmailProps = {
  /** Link único de confirmação gerado no backend */
  confirmUrl: string;
  /** Nome do usuário (opcional) */
  name?: string;
  /** Ano atual (para rodapé) */
  year?: number;
  /** E-mail de suporte (opcional) */
  supportEmail?: string;
};

export default function ConfirmEmailLinkEmail({
  confirmUrl,
  name,
  year = new Date().getFullYear(),
  supportEmail = 'suporte@domo.app',
}: ConfirmEmailLinkEmailProps) {
  const preview = `Confirme seu e-mail para ativar sua conta no Domo`;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>

      <Tailwind>
        <Body className="bg-gray-50 m-0 p-0 font-sans">
          <Container className="max-w-[600px] my-10 mx-auto bg-white rounded-xl p-8 shadow-sm">
            <Section>
              <Text className="text-xl font-semibold text-gray-900 m-0">Confirme seu e-mail</Text>

              <Text className="text-base text-gray-700 mt-3">{name ? `Olá, ${name}.` : 'Olá,'}</Text>

              <Text className="text-base text-gray-700">
                Seja bem-vindo(a) ao <strong>Domo</strong> 🎉. Para ativar sua conta e garantir mais segurança, clique
                no botão abaixo:
              </Text>

              {/* Botão de confirmação */}
              <Section className="mt-6 mb-6 text-center">
                <Button
                  href={confirmUrl}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base no-underline"
                >
                  Confirmar e-mail
                </Button>
              </Section>

              <Text className="text-sm text-gray-600 text-center">
                Se o botão não funcionar, copie e cole este link no navegador:
              </Text>
              <Text className="text-xs text-gray-500 break-all text-center mt-2">{confirmUrl}</Text>

              <Hr className="my-6 border-gray-200" />

              <Text className="text-sm text-gray-600">
                Se você <strong>não criou</strong> uma conta no Domo, ignore este e-mail.
              </Text>

              <Text className="text-sm text-gray-600">
                Precisa de ajuda? Entre em contato: <span className="text-gray-900">{supportEmail}</span>
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
