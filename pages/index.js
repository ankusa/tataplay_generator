import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Grid, Message, Segment, Icon, Image, Container, Header, Divider, Loader } from 'semantic-ui-react';

export default function Home() {
  const [shortUrl, setShortUrl] = useState("");
  const [err, setErr] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const url = `${window.location.origin.replace('localhost', '127.0.0.1')}/api/getM3u?sid=tplay_A&id=1028268934&sname=tataP&tkn=cheapgeeky.com`;

    shortenUrl(url)
      .then(short => setShortUrl(short))
      .catch(error => {
        console.error('Error generating short URL:', error);
        setErr('Error generating short URL. Please try refreshing the page.');
      });

    fetchVisitorCount();
  }, []);

  async function shortenUrl(longUrl) {
    try {
      const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BITLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ long_url: longUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }

      const data = await response.json();
      return data.link;
    } catch (error) {
      throw new Error('Error shortening URL');
    }
  }

  async function fetchVisitorCount() {
    try {
      const response = await fetch('/api/visitor-count');
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching visitor count:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
      const data = await response.json();
      console.log('Visitor count data:', data);
      setVisitorCount(data.count || 'No visitor count data');
    } catch (error) {
      console.error('Error:', error);
      setVisitorCount('Error fetching visitor count');
    }
  }

  return (
    <div>
      <Head>
        <title>TATA PLAY COPY PASTE M3U</title>
        <meta name="description" content="Easiest way to generate a Tata Play IPTV (m3u) playlist." />
      </Head>

      <Container text>
        <Grid centered>
          <Grid.Row>
            <Grid.Column>
              <Image src='https://upload.wikimedia.org/wikipedia/commons/2/29/Tata_Play_2022_logo.svg' size='huge' alt='TataPlay' centered />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column computer={10} tablet={12} mobile={16}>
              <Segment>
                <Header as='h2'>
                  <Icon name='linkify' />
                  <Header.Content>M3U Short URL</Header.Content>
                </Header>
                {shortUrl ? (
                  <Message positive>
                    <p>
                      <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a> 🎉
                    </p>
                  </Message>
                ) : (
                  <Loader active inline='centered' size='large'>Generating short URL...</Loader>
                )}
                <Divider />
                <p>
                  Use the M3U URL in the OTT Navigator or Tivimate app for all channels.
                </p>
                <p>
                  Set data reload to 10 minutes and enjoy uninterrupted viewing!
                </p>
                <p>The generated M3U URL is permanent and does not need to be refreshed every 24 hours. Enjoy!</p>
                <p><strong>IMPORTANT:</strong> If you encounter an error with the generated URL, it might be due to an API issue. Simply wait for the API issue to be resolved.</p>
              </Segment>
              {err && (
                <Message negative>
                  <Message.Header><Icon name='exclamation circle' /> Error</Message.Header>
                  <p>{err}</p>
                </Message>
              )}
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Divider />
              <Header as='h3' textAlign='center'>
                <Icon name='world' />
                Visitor Information
              </Header>
              <p style={{ textAlign: 'center' }}>
                Visitor Count: {visitorCount}
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>

      <style jsx>{`
        .message-container {
          text-align: center;
        }
        .ui.image.huge {
          max-width: 400px;
          margin: auto;
        }
      `}</style>
    </div>
  );
                  }
