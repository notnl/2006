
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';


export default function MenuComponent() {

    const router = useRouter();
    return (
        <>
            
            <Button onPress={() => router.navigate('/map')}>
              <Text>Map</Text>
            </Button>

            <Button onPress={() => router.navigate('/scoreboard')}>
              <Text>Scoreboard</Text>
            </Button>

            <Button onPress={() => router.navigate('/rewards')}>
              <Text>Rewards</Text>
            </Button>

            <Button onPress={() => router.navigate('/challenges')}>
              <Text>Challenges</Text>
            </Button>

            <Button onPress={() => router.navigate('/profile')}>
              <Text>Profile</Text>
            </Button>

        </>
    )

}
